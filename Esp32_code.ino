#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi
const char* WIFI_SSID = "Vedat";
const char* WIFI_PASS = "123456789";

// MQTT (Pi IP)
const char* MQTT_SERVER = "172.20.10.2";
const int MQTT_PORT = 1883;
const char* MQTT_USER   = "vedat";
const char* MQTT_PASS   = "12345";

const int FLOW_PIN = 13;
volatile uint32_t pulseCount = 0;
volatile unsigned long lastPulseMs = 0;

unsigned long lastReportMs = 0;
float totalLiters = 0.0f;
static const float PULSES_PER_LITER = 450.0f;

WiFiClient espClient;
PubSubClient client(espClient);

void IRAM_ATTR onFlowPulse() {
  pulseCount++;
  lastPulseMs = millis();
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    String cid = "esp32-flow-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    Serial.print("MQTT connecting to ");
    Serial.print(MQTT_SERVER);
    Serial.print(" ... ");

    bool ok = client.connect(cid.c_str(), MQTT_USER, MQTT_PASS);

    if (ok) {
      Serial.println("CONNECTED");
    } else {
      Serial.print("FAILED, rc=");
      Serial.print(client.state()); // important!
      Serial.println(" (retry in 1s)");
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), onFlowPulse, RISING);

  Serial.println("ESP32 Flow Sensor + MQTT Started");
  Serial.printf("FLOW_PIN=%d, PULSES_PER_LITER=%.2f\n", FLOW_PIN, PULSES_PER_LITER);

  connectWiFi();

  client.setServer(MQTT_SERVER, MQTT_PORT);

  lastReportMs = millis();
}

void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  unsigned long now = millis();
  if (now - lastReportMs >= 1000) {
    uint32_t pulses;
    unsigned long lp;

    noInterrupts();
    pulses = pulseCount;
    pulseCount = 0;
    lp = lastPulseMs;
    interrupts();

    float litersPerSecond = ((float)pulses) / PULSES_PER_LITER;
    float flowLpm = litersPerSecond * 60.0f;
    totalLiters += litersPerSecond;

    bool flowing = (now - lp) < 2000;

    char json[160];
    snprintf(json, sizeof(json),
             "{\"flow_lpm\":%.3f,\"total_l\":%.3f,\"pulses_1s\":%lu,\"flowing\":%s}",
             flowLpm, totalLiters, (unsigned long)pulses, flowing ? "true" : "false");

    bool pubOk = client.publish("water/flow/json", json, true);
    Serial.print("PUB ");
    Serial.print(pubOk ? "OK " : "FAIL ");
    Serial.println(json);

    lastReportMs = now;
  }
}
