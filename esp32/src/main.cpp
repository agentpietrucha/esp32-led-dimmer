#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

#define LED 2
#define OUTPUT_PIN 16

Preferences preferences;

DNSServer dnsServer;
bool dns = false;

WebServer server;

WiFiClientSecure client;
PubSubClient *pbClient = new PubSubClient(client);
const char *mqttServer = "broker.hivemq.com"; // MQTT server URL
// const char *mqttServer = "a8a9d2e032084708827f7fef059f8949.s1.eu.hivemq.cloud"; // MQTT server URL
bool mqttReady = false;

int time1 = 0;
bool shouldRestart = false;

int pinVoltage = 10;

const int freq = 60000;
const int ledChannel = 0;
const int resolution = 8;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Setup Wi-Fi connection</title>
  <style>
    input {
      font-size: 32px;
      margin-top: 0;
      margin-bottom: 0;
      padding: 0.5rem;
      margin-top: 10px;
    }
    input[type=submit] {
      font-size: 36px;
      margin-top: 36px;
    }
    form {
      max-width: 250px;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <main style="display: flex; justify-content: center; align-items: center; height: 100vh; width: 100vw;">
    <form action="/config-setup" method="get">
      <input required type="text" name="name" id="name" placeholder="Wi-Fi Name">
      <input required type="password" name="password" id="password" placeholder="Password">
      <input required type="email" name="email" id="email" placeholder="Email">
      <input type="submit" value="Let's go">
    </form>
  </main>
</body>
</html>)rawliteral";

void createAccessPoint();
void connectWiFi();
void root();
void handleSetup();
bool credentialsPresent();
void setupPins();
void setupPreferences();
void blink(int count);
void registerDevice();
void setupMQTT();
void mqttCallback(char *topic, byte *payload, unsigned int length);
void reconnect();
void buttonPressHandler();

void setup()
{
  Serial.begin(115200);
  String macAddress = WiFi.macAddress();
  Serial.print("MAC address: ");
  Serial.println(macAddress);
  setupPreferences();
  setupPins();

  if (credentialsPresent())
  { // wifi data present
    connectWiFi();
    registerDevice();
    setupMQTT();
  }
  else
  { // no wifi data
    createAccessPoint();
  }
}

void loop()
{
  if (shouldRestart)
  {
    blink(2);
    preferences.clear();
    ESP.restart();
  }
  if (dns)
  {
    dnsServer.processNextRequest();
    server.handleClient();
  }

  if (mqttReady)
  {
    ledcWrite(ledChannel, pinVoltage);
    if (!pbClient->connected())
    {
      reconnect();
    }
    pbClient->loop();
  }
}

void createAccessPoint()
{
  WiFi.mode(WIFI_AP);
  WiFi.softAP("ESP LED");

  delay(100);

  server.onNotFound(root);
  server.on("/", HTTP_GET, root);
  server.on("/config-setup", HTTP_GET, handleSetup);

  dnsServer.start(53, "*", WiFi.softAPIP());
  dns = true;
  server.begin();
}

void connectWiFi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(preferences.getString("W_NAME"), preferences.getString("W_PASSWD"));

  int count = 0;
  while (WiFi.status() != WL_CONNECTED && count < 50)
  {
    delay(250);
    count++;
  }

  // if wifi connection failed
  if (WiFi.status() != WL_CONNECTED)
  {
    blink(3);
    preferences.clear();
    ESP.restart();
  }

  // if wifi connection succeed
  if (WiFi.status() == WL_CONNECTED)
  {
    blink(1);
  }

  Serial.println(WiFi.localIP());
}

void root()
{
  Serial.println("[Server] root");
  Serial.print("[Server] uri:");
  Serial.println(server.uri());

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendContent(index_html);
}

void handleSetup()
{
  Serial.println("[Server] handleSetup");
  Serial.println("setup request");
  Serial.print("arguments:");
  Serial.println(server.arg("name"));
  Serial.println(server.arg("password"));
  Serial.println(server.arg("email"));

  preferences.putString("W_NAME", server.arg("name"));
  preferences.putString("W_PASSWD", server.arg("password"));
  preferences.putString("W_EMAIL", server.arg("email"));

  server.send(200, "text/plain", "Credentials saved successfully!\nConnecting to Wi-Fi");

  delay(1000);

  ESP.restart();
}

bool credentialsPresent()
{
  return preferences.getString("W_NAME", "") != "" && preferences.getString("W_PASSWD", "") != "";
}

void setupPins()
{
  pinMode(LED, OUTPUT);
  pinMode(0, INPUT);
  attachInterrupt(0, buttonPressHandler, HIGH);

  ledcSetup(ledChannel, freq, resolution);
  ledcAttachPin(OUTPUT_PIN, ledChannel);
}

void setupPreferences()
{
  preferences.begin("esp32");
  // preferences.clear(); // for testing only
}

void blink(int count)
{
  for (int i = 0; i < count; i++)
  {
    digitalWrite(LED, HIGH);
    delay(1000);
    digitalWrite(LED, LOW);
    delay(1000);
  }
}

void registerDevice()
{
  if (preferences.getBool("W_REGISTERED"))
  {
    return;
  }
  HTTPClient http;
  http.begin("http://192.168.1.121:3000/api/device/register");
  http.addHeader("Content-Type", "application/json");
  String body = "{\"mac_address\": \"" + WiFi.macAddress() + "\", \"email\": \"" + preferences.getString("W_EMAIL") + "\"}";
  int code = http.POST(body);
  if (code == 201)
  {
    preferences.putBool("W_REGISTERED", true);
  }
  else
  {
    ESP.restart();
  }
}

void setupMQTT()
{
  client.setInsecure();
  pbClient->setServer(mqttServer, 8883);
  pbClient->setCallback(mqttCallback);
  mqttReady = true;
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
  // if (strcmp(topic, "switch") == 0) // working
  // {
  //   if ((char)payload[0] == '0')
  //   {
  //     // turn off
  //     digitalWrite(LED, LOW);
  //   }
  //   else if ((char)payload[0] == '1')
  //   {
  //     // turn on
  //     digitalWrite(LED, HIGH);
  //   }
  // }
  // else
  String mac = WiFi.macAddress();
  Serial.print("topis:");
  Serial.println(topic);
  if (strcmp(topic, String("dim/" + mac).c_str()) == 0) // working
  {
    char x = (char)payload[0];
    char y[length];
    for (int i = 0; i < length; i++)
    {
      y[i] = static_cast<char>(payload[i]);
    }

    int dimValue = atoi(y);
    if (dimValue > 100)
    {
      dimValue = 100;
    }
    else if (dimValue < 0)
    {
      dimValue = 0;
    }

    Serial.print("Dim value: ");
    Serial.println(dimValue);

    pinVoltage = dimValue;
  }
  else if (strcmp(topic, String("get_status/" + mac).c_str()) == 0)
  {
    Serial.println("get_status");
    pbClient->publish(String("status/" + WiFi.macAddress()).c_str(), String(pinVoltage).c_str());
  }
}

void reconnect()
{
  int count = 0;
  while (!pbClient->connected() && count < 10)
  {
    String clientId = "ESP Client";
    if (pbClient->connect(clientId.c_str(), "espled", "espLEDespL3D"))
    {
      String mac = WiFi.macAddress();
      Serial.print("dim topic: ");
      Serial.println(String("dim/" + mac));
      Serial.print("get_status topic: ");
      Serial.println(String("get_status/" + mac));
      pbClient->subscribe(String("dim/" + mac).c_str());
      pbClient->subscribe(String("get_status/" + mac).c_str());
    }
    else
    {
      delay(2500);
    }
    count++;
  }
  if (count == 10 && !pbClient->connected())
  {
    ESP.restart();
  }
}

void IRAM_ATTR buttonPressHandler()
{
  detachInterrupt(0);

  if (time1 == 0)
  { // first press
    time1 = millis();
  }
  else
  {
    int diff = millis() - time1;
    if (diff <= 2000)
    {
      time1 = 0;
      shouldRestart = true;
    }
    else
    {
      time1 = millis();
    }
    attachInterrupt(0, buttonPressHandler, HIGH);
    return;
  }
  attachInterrupt(0, buttonPressHandler, HIGH);
}