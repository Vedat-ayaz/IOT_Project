#this code work in the raspberry pi to control the water valve based on flow rate and ML model

#!/usr/bin/env python3
import json
import time
import subprocess
import traceback

import numpy as np
import pandas as pd
import joblib
import requests
from paho.mqtt import client as mqtt

# ============================================================
# CONFIG
# ============================================================
MODEL_PATH = "/home/vedat/water_fixture_model.joblib"
META_PATH  = "/home/vedat/water_fixture_model_meta.json"

BROKER_HOST = "localhost"
BROKER_PORT = 1883
TOPIC = "water/flow/json"

# ---- Backend API ----
MAC_IP   = "172.20.10.4"
MAC_PORT = 8080

MAC_API_TELEMETRY = f"http://{MAC_IP}:{MAC_PORT}/api/telemetry"
MAC_API_INFERENCE = f"http://{MAC_IP}:{MAC_PORT}/api/inferences"

DEVICE_UID = "RASPI-001"
API_KEY    = "raspi_key_12345"
HTTP_TIMEOUT = 2.5

# ---- GPIO / Relay ----
GPIO = 17
RELAY_ACTIVE_HIGH = True

# ---- Flow / Event ----
FLOW_ON_LPM   = 0.15
END_GAP_SEC   = 2.0
MIN_EVENT_SEC = 2.0

# ---- Real-time control duty profiles ----
# FULL_OPEN : %100 (always ON)
# LIMIT_50  : %50  (1s ON / 1s OFF)
# LIMIT_75  : %25  (1s ON / 3s OFF)
PROFILE_DUTY = {
    "FULL_OPEN": (1.0, 0.0),
    "LIMIT_50":  (1.0, 1.0),
    "LIMIT_75":  (1.0, 3.0),
}

# If you want inference to also be embedded into telemetry rawPayload:
EMBED_ML_IN_TELEMETRY = True

EPS = 1e-6

# ============================================================
# LOAD MODEL + META
# ============================================================
clf = joblib.load(MODEL_PATH)

FEATURE_COLS = [
    "duration","liters","month","hour","day","ec_from_midnight",
    "max_flow","av_flow_rate","flow_std","p10_flow","p90_flow",
    "iqr_flow","active_ratio","peak_to_mean"
]
CLASS_NAMES = None
MODEL_NAME = "water_fixture_model"
MODEL_VERSION = "unknown"

try:
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    FEATURE_COLS  = meta.get("feature_cols", FEATURE_COLS)
    CLASS_NAMES   = meta.get("label_encoder_classes", None)
    MODEL_VERSION = meta.get("model_version", meta.get("version", "unknown"))
except Exception:
    pass

# ============================================================
# GPIO helpers (pinctrl)
# ============================================================
def _pinctrl(*args):
    subprocess.run(["pinctrl", *map(str, args)], check=False)

def gpio_init():
    _pinctrl("set", str(GPIO), "op")  # output

def relay_set(on: bool):
    # pinctrl: dh=drive high, dl=drive low
    level = "dh" if on else "dl"
    if not RELAY_ACTIVE_HIGH:
        level = "dl" if on else "dh"
    _pinctrl("set", str(GPIO), level)

# ============================================================
# HTTP helpers
# ============================================================
def post_json(url: str, payload: dict):
    try:
        r = requests.post(url, json=payload, timeout=HTTP_TIMEOUT)
        return r.status_code, r.text[:200]
    except Exception as e:
        return None, str(e)

# ============================================================
# REAL-TIME CONTROL (Duty cycle)
# ============================================================
current_profile = "FULL_OPEN"
duty_state_on = True
last_switch_ts = time.time()

def decide_profile_from_flow(flow_lpm: float) -> str:
    """
    İSTEDİĞİN KURAL:
    - 0   - 39.999  => %100 açık (FULL_OPEN)
    - 40  - 79.999  => %50  açık (LIMIT_50)
    - 80+           => %25  açık (LIMIT_75)
    """
    if flow_lpm >= 80.0:
        return "LIMIT_75"
    elif flow_lpm >= 40.0:
        return "LIMIT_50"
    else:
        return "FULL_OPEN"

def set_profile(profile: str):
    """
    - profile değişince duty timer reset
    - state ON yap
    - pin'i anında doğru seviyeye çek
    """
    global current_profile, duty_state_on, last_switch_ts

    if profile == current_profile:
        return

    current_profile = profile
    duty_state_on = True
    last_switch_ts = time.time()

    # Apply immediate output
    relay_set(True)  # her profile değişiminde ON fazıyla başla
    print("[CTRL] PROFILE ->", current_profile)

def control_loop_tick():
    global duty_state_on, last_switch_ts

    on_sec, off_sec = PROFILE_DUTY[current_profile]

    # FULL_OPEN
    if off_sec == 0.0:
        relay_set(True)
        return

    now = time.time()

    # ON -> OFF
    if duty_state_on and (now - last_switch_ts) >= on_sec:
        duty_state_on = False
        last_switch_ts = now
        relay_set(False)

    # OFF -> ON
    elif (not duty_state_on) and (now - last_switch_ts) >= off_sec:
        duty_state_on = True
        last_switch_ts = now
        relay_set(True)

def current_valve_state(flow_lpm: float) -> str:
    if flow_lpm <= FLOW_ON_LPM:
        return "CLOSED"
    if current_profile == "FULL_OPEN":
        return "OPEN"
    return "PARTIAL"

# ============================================================
# EVENT BUFFER + ML FEATURE EXTRACT
# ============================================================
event_samples = []   # list[(ts_sec, flow_lpm)]
last_active = None
event_start = None

def time_features_from_epoch_seconds(t0: float):
    dt0 = pd.to_datetime(int(t0), unit="s", errors="coerce")
    if pd.isna(dt0):
        return np.nan, np.nan, np.nan, np.nan
    return int(dt0.month), int(dt0.hour), int(dt0.weekday()), int(dt0.hour*3600 + dt0.minute*60 + dt0.second)

def summarize_flow_segment(seg):
    seg = np.asarray(seg, dtype=float)
    if len(seg) == 0:
        return dict(
            max_flow=0.0, av_flow_rate=0.0, flow_std=0.0,
            p10_flow=0.0, p90_flow=0.0, iqr_flow=0.0,
            active_ratio=0.0, peak_to_mean=0.0
        )
    return dict(
        max_flow=float(np.max(seg)),
        av_flow_rate=float(np.mean(seg)),
        flow_std=float(np.std(seg)),
        p10_flow=float(np.percentile(seg, 10)),
        p90_flow=float(np.percentile(seg, 90)),
        iqr_flow=float(np.percentile(seg, 90) - np.percentile(seg, 10)),
        active_ratio=float(np.mean(seg > FLOW_ON_LPM)),
        peak_to_mean=float(np.max(seg) / (np.mean(seg) + EPS))
    )

def compute_liters(ts, f):
    liters = 0.0
    for i in range(len(ts)-1):
        dt = max(ts[i+1] - ts[i], 0.0)
        liters += max(f[i], 0.0) * (dt / 60.0)  # L/min * min
    return float(liters)

def predict_fixture(X_df: pd.DataFrame):
    if hasattr(clf, "predict_proba"):
        proba = clf.predict_proba(X_df)[0]
        idx = int(np.argmax(proba))
        conf = float(proba[idx])
        if CLASS_NAMES is not None:
            label = CLASS_NAMES[idx]
        else:
            label = str(clf.classes_[idx])
        return label, conf
    yhat = clf.predict(X_df)[0]
    return str(yhat), 1.0

def build_event_features(ts, f):
    dur = float(ts[-1] - ts[0])
    liters = compute_liters(ts, f)
    stats = summarize_flow_segment(f)
    month, hour, day, ec = time_features_from_epoch_seconds(ts[0])

    row = {
        "duration": dur * 1000.0,
        "liters": liters,
        "month": month,
        "hour": hour,
        "day": day,
        "ec_from_midnight": ec,
        **stats
    }
    for c in FEATURE_COLS:
        if c not in row:
            row[c] = np.nan
    X = pd.DataFrame([row], columns=FEATURE_COLS)

    info = {
        "event_start_ts": float(ts[0]),
        "event_end_ts": float(ts[-1]),
        "duration_sec": dur,
        "liters": liters,
        "mean_flow_lpm": float(np.mean(f)) if len(f) else 0.0,
        "max_flow_lpm": float(np.max(f)) if len(f) else 0.0,
        "features": row
    }
    return X, info

def decide_reason(pred_label, conf, info):
    if conf < 0.45:
        return "LOW_CONF"
    return "MODEL_OK"

def maybe_finalize_event(now_ts: float):
    global event_samples, last_active, event_start

    if not event_samples or last_active is None or event_start is None:
        return None

    if (now_ts - last_active) < END_GAP_SEC:
        return None

    ts = np.array([x[0] for x in event_samples], dtype=float)
    f  = np.array([x[1] for x in event_samples], dtype=float)

    dur = float(ts[-1] - ts[0])
    if dur < MIN_EVENT_SEC:
        event_samples.clear()
        last_active = None
        event_start = None
        return None

    X, info = build_event_features(ts, f)
    label, conf = predict_fixture(X)
    reason = decide_reason(label, conf, info)

    result = {
        "deviceUid": DEVICE_UID,
        "apiKey": API_KEY,

        "modelName": MODEL_NAME,
        "modelVersion": MODEL_VERSION,

        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),

        "eventStart": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(info["event_start_ts"])),
        "eventEnd":   time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(info["event_end_ts"])),
        "durationSec": info["duration_sec"],
        "liters": info["liters"],
        "meanFlowLpm": info["mean_flow_lpm"],
        "maxFlowLpm": info["max_flow_lpm"],

        "predictedFixture": label,
        "confidence": conf,

        "decidedValveState": current_valve_state(float(f[-1])),
        "controlProfile": current_profile,
        "decisionReason": reason,

        "featuresJson": info["features"],
        "rawEventJson": {
            "samples_count": int(len(event_samples)),
        }
    }

    print(f"[EVENT] dur={dur:.1f}s liters={info['liters']:.3f} -> pred={label} conf={conf:.2f}")

    event_samples.clear()
    last_active = None
    event_start = None

    return result

# ============================================================
# MQTT callbacks
# ============================================================
def on_connect(client, userdata, flags, rc, properties=None):
    print("[MQTT] connected rc=", rc, "| subscribe:", TOPIC)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    global last_active, event_start

    try:
        data = json.loads(msg.payload.decode("utf-8", errors="ignore"))
        flow = float(data.get("flow_lpm", 0.0))
        total_l = float(data.get("total_l", 0.0))
        now = time.time()

        # 1) Realtime profile + duty cycle selection (NEW THRESHOLDS)
        set_profile(decide_profile_from_flow(flow))

        # 2) Event buffer
        if flow > FLOW_ON_LPM:
            if event_start is None:
                event_start = now
            event_samples.append((now, flow))
            last_active = now

        # 3) Telemetry
        telemetry_payload = {
            "deviceUid": DEVICE_UID,
            "apiKey": API_KEY,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "flowRateLpm": flow,
            "volumeTotal": total_l,
            "valveState": current_valve_state(flow),
            "rawPayload": {
                "esp": data,
                "control": {
                    "profile": current_profile,
                    "relay_state": "ON" if duty_state_on else "OFF",
                    "gpio": GPIO
                }
            }
        }

        # 4) ML inference on event end
        inf = maybe_finalize_event(now)
        if inf is not None:
            if EMBED_ML_IN_TELEMETRY:
                telemetry_payload["rawPayload"]["ml"] = inf

            code2, msg2 = post_json(MAC_API_INFERENCE, inf)
            if code2 is None:
                print("[INFERENCE HTTP ERR]", msg2)
            else:
                print("[INFERENCE HTTP]", code2)

        # Always send telemetry
        code, msg1 = post_json(MAC_API_TELEMETRY, telemetry_payload)
        if code is None:
            print("[TELEMETRY HTTP ERR]", msg1)
        else:
            print(f"[HTTP] {code} flow={flow:.3f} profile={current_profile} relay={'ON' if duty_state_on else 'OFF'}")

    except Exception as e:
        print("[ERR] on_message:", e)
        traceback.print_exc()

# ============================================================
# MAIN
# ============================================================
def main():
    gpio_init()
    relay_set(True)

    c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    c.on_connect = on_connect
    c.on_message = on_message
    c.connect(BROKER_HOST, BROKER_PORT, 30)

    print("[OK] ML valve controller running (Realtime + ML + telemetry + inference DB)")

    while True:
        c.loop(timeout=0.1)
        control_loop_tick()
        time.sleep(0.02)

if __name__ == "__main__":
    main()

