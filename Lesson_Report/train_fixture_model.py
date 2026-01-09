import os, json, joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

# -----------------------
# PATHS on Raspberry Pi
# -----------------------
WEUSEDTO_DIR = os.path.expanduser("~/datasets/WEUSEDTO-Data-main")
KIOS_DIR     = os.path.expanduser("~/datasets/Water-Usage-Dataset-main")
OUT_DIR      = os.path.expanduser("~")

MODEL_PATH = os.path.join(OUT_DIR, "water_fixture_model.joblib")
META_PATH  = os.path.join(OUT_DIR, "water_fixture_model_meta.json")

RANDOM_STATE = 42
TEST_SIZE = 0.2
EPS = 1e-6

# Event extraction settings
WE_FLOW_EPS = 0.0
WE_MAX_GAP_SECONDS = 1.0
WE_MIN_EVENT_SECONDS = 2.0

KIOS_DT_SECONDS = 10.0
KIOS_FLOW_EPS = 0.0
KIOS_MIN_EVENT_SECONDS = 20.0

# -----------------------
# Helpers
# -----------------------
def list_csv_files(root):
    out = []
    if not os.path.isdir(root):
        return out
    for dp, _, fn in os.walk(root):
        for f in fn:
            if f.lower().endswith(".csv"):
                out.append(os.path.join(dp, f))
    return sorted(out)

def extract_fixture_label_from_filename(path):
    name = os.path.basename(path)
    base = name.replace(".csv", "").replace(".MYD", "")
    base = base.replace("feed_", "").replace("feed.", "")
    return base.strip().strip("_").strip(".")

def to_float_series(s):
    return pd.to_numeric(s, errors="coerce")

def time_features_from_epoch_seconds(t0):
    dt0 = pd.to_datetime(int(t0), unit="s", errors="coerce")
    if pd.isna(dt0):
        return np.nan, np.nan, np.nan, np.nan
    month = int(dt0.month)
    hour  = int(dt0.hour)
    day   = int(dt0.weekday())
    ec    = int(dt0.hour*3600 + dt0.minute*60 + dt0.second)
    return month, hour, day, ec

def summarize_flow_segment(seg_f, active_eps):
    seg_f = np.asarray(seg_f, dtype=float)
    if len(seg_f) == 0:
        return dict(
            max_flow=0.0, av_flow_rate=0.0, flow_std=0.0,
            p10_flow=0.0, p90_flow=0.0, iqr_flow=0.0,
            active_ratio=0.0, peak_to_mean=0.0
        )
    max_flow = float(np.max(seg_f))
    mean_flow = float(np.mean(seg_f))
    std_flow  = float(np.std(seg_f))
    p10 = float(np.percentile(seg_f, 10))
    p90 = float(np.percentile(seg_f, 90))
    iqr = float(p90 - p10)
    active_ratio = float(np.mean(seg_f > active_eps))
    peak_to_mean = float(max_flow / (mean_flow + EPS))
    return dict(
        max_flow=max_flow,
        av_flow_rate=mean_flow,
        flow_std=std_flow,
        p10_flow=p10,
        p90_flow=p90,
        iqr_flow=iqr,
        active_ratio=active_ratio,
        peak_to_mean=peak_to_mean
    )

# -----------------------
# WEUSEDTO loader
# -----------------------
def load_weusedto(path):
    # Try header=0 first
    df = pd.read_csv(path, sep=None, engine="python", header=0)
    cols = [str(c).lower() for c in df.columns]

    if ("time" in cols) and ("flow" in cols) and ("end time" in cols):
        # event table
        df = df.rename(columns={df.columns[cols.index("time")]: "Time",
                                df.columns[cols.index("flow")]: "Flow",
                                df.columns[cols.index("end time")]: "End time"})
        return "event_table", df[["Time","Flow","End time"]].copy()

    # if header is actually numeric, read without header
    if df.shape[1] == 2 and all(_is_num_like(c) for c in df.columns):
        df2 = pd.read_csv(path, sep=None, engine="python", header=None)
        df2 = df2.iloc[:, :2].copy()
        df2.columns = ["Time","Flow"]
        return "timeseries", df2

    # 2-col timeseries
    if df.shape[1] >= 2:
        # locate time/flow if exists
        if "time" in cols and "flow" in cols:
            df = df.rename(columns={df.columns[cols.index("time")]: "Time",
                                    df.columns[cols.index("flow")]: "Flow"})
            return "timeseries", df[["Time","Flow"]].copy()
        # fallback first 2 columns
        df2 = df.iloc[:, :2].copy()
        df2.columns = ["Time","Flow"]
        return "timeseries", df2

    raise RuntimeError(f"Unknown WEUSEDTO schema: {path}")

def _is_num_like(x):
    try:
        float(str(x).strip())
        return True
    except:
        return False

def weusedto_events_event_table(df_ev):
    t0 = to_float_series(df_ev["Time"]).values
    t1 = to_float_series(df_ev["End time"]).values
    fl = to_float_series(df_ev["Flow"]).fillna(0.0).values
    rows = []
    for i in range(len(df_ev)):
        if np.isnan(t0[i]) or np.isnan(t1[i]): 
            continue
        start = float(t0[i]); end = float(t1[i])
        dur_s = max(end - start, 0.0)
        if dur_s < WE_MIN_EVENT_SECONDS: 
            continue
        flow = float(0.0 if np.isnan(fl[i]) else fl[i])
        liters = flow * (dur_s/60.0)  # flow is L/min assumed -> liters
        month, hour, day, ec = time_features_from_epoch_seconds(start)
        stats = summarize_flow_segment([flow, flow, flow], WE_FLOW_EPS)
        rows.append({
            "duration": dur_s*1000.0,
            "liters": liters,
            "month": month, "hour": hour, "day": day, "ec_from_midnight": ec,
            **stats
        })
    return rows

def weusedto_events_timeseries(df_ts):
    t = to_float_series(df_ts["Time"]).dropna().astype(float).values
    f = to_float_series(df_ts["Flow"]).fillna(0.0).astype(float).values
    if len(t) < 2:
        return []
    idx = np.argsort(t); t=t[idx]; f=f[idx]
    diffs = np.diff(t); diffs = diffs[diffs>0]
    dt_med = float(np.median(diffs)) if len(diffs) else 1.0

    rows=[]
    in_evt=False; start_i=None; last_active=None
    for i in range(len(t)):
        active = f[i] > WE_FLOW_EPS
        if active and not in_evt:
            in_evt=True; start_i=i; last_active=t[i]
        elif active and in_evt:
            last_active=t[i]
        elif (not active) and in_evt:
            if (t[i]-last_active) <= WE_MAX_GAP_SECONDS:
                continue
            start_time=t[start_i]; end_time=last_active
            dur=end_time-start_time
            if dur < WE_MIN_EVENT_SECONDS:
                in_evt=False; start_i=None; last_active=None
                continue
            # segment
            end_i=start_i
            while end_i+1 < len(t) and t[end_i+1] <= end_time + 1e-9:
                end_i += 1
            seg_t=t[start_i:end_i+1]; seg_f=f[start_i:end_i+1]
            liters=0.0
            for j in range(len(seg_t)-1):
                dt=max(seg_t[j+1]-seg_t[j],0.0)
                liters += max(seg_f[j],0.0)*(dt/60.0) # L/min * min
            liters += max(seg_f[-1],0.0)*(dt_med/60.0)
            month,hour,day,ec = time_features_from_epoch_seconds(start_time)
            stats=summarize_flow_segment(seg_f, WE_FLOW_EPS)
            rows.append({
                "duration": dur*1000.0,
                "liters": liters,
                "month": month, "hour": hour, "day": day, "ec_from_midnight": ec,
                **stats
            })
            in_evt=False; start_i=None; last_active=None
    return rows

def build_weusedto_events(root):
    dataset_dir = os.path.join(root, "Dataset")
    files = [p for p in list_csv_files(dataset_dir) if os.path.basename(p).lower().startswith("feed")]
    rows_all=[]
    print("[WEUSEDTO] files:", len(files))
    for p in files:
        fixture = extract_fixture_label_from_filename(p)
        schema, df = load_weusedto(p)
        rows = weusedto_events_event_table(df) if schema=="event_table" else weusedto_events_timeseries(df)
        for r in rows:
            r["fixture"]=fixture; r["source"]="WEUSEDTO"
        rows_all.extend(rows)
    return pd.DataFrame(rows_all)

# -----------------------
# KIOS loader (regular 10s)
# -----------------------
def normalize_kios_name(c):
    s=str(c).lower()
    if "toilet" in s: return "Toilet"
    if "shower" in s: return "Shower"
    if "dish" in s: return "Dishwasher30"
    if "cloth" in s or "wash" in s: return "Washingmachine"
    if "faucet" in s or "tap" in s: return "Kitchenfaucet"
    return str(c)

def extract_events_regular(flow, dt_s, eps, min_sec):
    f=np.asarray(flow, dtype=float)
    f=np.nan_to_num(f, nan=0.0)
    active = f>eps
    if not np.any(active): return []
    a=active.astype(np.int8)
    diff=np.diff(a, prepend=0, append=0)
    starts=np.where(diff==1)[0]
    ends=np.where(diff==-1)[0]-1
    rows=[]
    for st,en in zip(starts,ends):
        length=en-st+1
        dur=length*dt_s
        if dur < min_sec: 
            continue
        seg=f[st:en+1]
        liters=float(np.sum(np.maximum(seg,0.0))*(dt_s/60.0)) # assume L/min -> L
        stats=summarize_flow_segment(seg, eps)
        rows.append({
            "duration": dur*1000.0,
            "liters": liters,
            "month": np.nan, "hour": np.nan, "day": np.nan, "ec_from_midnight": np.nan,
            **stats
        })
    return rows

def build_kios_events(root):
    dataset_dir=os.path.join(root, "Dataset")
    files=list_csv_files(dataset_dir)
    rows_all=[]
    print("[KIOS] files:", len(files))
    for p in files:
        df=pd.read_csv(p)
        if df.shape[1] < 2: 
            continue
        cols=list(df.columns)
        appliance_cols=cols[1:]  # first col is total
        for c in appliance_cols:
            label=normalize_kios_name(c)
            series=pd.to_numeric(df[c], errors="coerce").fillna(0.0).values
            rows=extract_events_regular(series, KIOS_DT_SECONDS, KIOS_FLOW_EPS, KIOS_MIN_EVENT_SECONDS)
            for r in rows:
                r["fixture"]=label; r["source"]="KIOS"
            rows_all.extend(rows)
    return pd.DataFrame(rows_all)

# -----------------------
# Train
# -----------------------
we_df = build_weusedto_events(WEUSEDTO_DIR)
kios_df = build_kios_events(KIOS_DIR)
events_df = pd.concat([we_df, kios_df], ignore_index=True)
events_df = events_df.dropna(subset=["fixture"])

feature_cols = [
    "duration","liters","month","hour","day","ec_from_midnight",
    "max_flow","av_flow_rate","flow_std","p10_flow","p90_flow","iqr_flow",
    "active_ratio","peak_to_mean"
]
for c in feature_cols:
    if c not in events_df.columns:
        events_df[c] = np.nan

X = events_df[feature_cols].copy()
y_str = events_df["fixture"].astype(str)

le = LabelEncoder()
y = le.fit_transform(y_str)
class_names = list(le.classes_)

min_class = int(pd.Series(y).value_counts().min())
use_stratify = (min_class >= 2)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE,
    shuffle=True, stratify=y if use_stratify else None
)

preprocess = ColumnTransformer(
    transformers=[
        ("num", Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]), feature_cols),
    ],
    remainder="drop"
)

model = RandomForestClassifier(
    n_estimators=400,
    random_state=RANDOM_STATE,
    n_jobs=-1,
    class_weight="balanced"
)

clf = Pipeline(steps=[("prep", preprocess), ("model", model)])
clf.fit(X_train, y_train)

pred = clf.predict(X_test)
acc = accuracy_score(y_test, pred)

print("\nAccuracy:", acc)
print(classification_report(y_test, pred, target_names=class_names, zero_division=0))

joblib.dump(clf, MODEL_PATH)
meta = {"feature_cols": feature_cols, "label_encoder_classes": class_names}
with open(META_PATH, "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print("\n[SAVED]")
print(MODEL_PATH)
print(META_PATH)