// #include <WiFiClientSecure.h>
// #include <PubSubClient.h>

// const char *ssid = "s1";           // your network SSID (name of wifi network)
// const char *password = "siemanko"; // your network password

// const char *server = "a8a9d2e032084708827f7fef059f8949.s1.eu.hivemq.cloud"; // Server URL

// #define LED 2

// WiFiClientSecure client;

// PubSubClient *pbClient;

// void callback(char *topic, byte *payload, unsigned int length)
// {
//   if (strcmp(topic, "switch") == 0) // working
//   {
//     if ((char)payload[0] == '0')
//     {
//       // turn off
//       digitalWrite(LED, LOW);
//     }
//     else if ((char)payload[0] == '1')
//     {
//       // turn on
//       digitalWrite(LED, HIGH);
//     }
//   }
//   else if (strcmp(topic, "dim") == 0) // working
//   {
//     char x = (char)payload[0];
//     char y[length];
//     for (int i = 0; i < length; i++)
//     {
//       y[i] = static_cast<char>(payload[i]);
//     }

//     int dimValue = atoi(y);
//     Serial.print("Dim value: ");
//     Serial.println(dimValue);
//   }
// }

// void reconnect()
// {
//   while (!pbClient->connected())
//   {
//     Serial.print("Attempting MQTT connection…");
//     String clientId = "ESP Client";
//     if (pbClient->connect(clientId.c_str(), "espled", "espLEDespL3D"))
//     {
//       Serial.println("connected");
//       pbClient->subscribe("switch");
//       pbClient->subscribe("dim");
//       pbClient->subscribe("status");
//     }
//     else
//     {
//       Serial.print("failed, rc = ");
//       Serial.print(pbClient->state());
//       Serial.println(" try again in 5 seconds");
//       // Wait 5 seconds before retrying
//       delay(5000);
//     }
//   }
// }

// void setup()
// {
//   // Initialize serial and wait for port to open:
//   Serial.begin(115200);
//   delay(100);

//   pinMode(LED, OUTPUT);

//   Serial.print("Attempting to connect to SSID: ");
//   Serial.println(ssid);
//   WiFi.begin(ssid, password);

//   // attempt to connect to Wifi network:
//   while (WiFi.status() != WL_CONNECTED)
//   {
//     Serial.print(".");
//     // wait 1 second for re-trying
//     delay(200);
//   }

//   Serial.print("Connected to ");
//   Serial.println(ssid);

//   Serial.println("\nStarting connection to server...");
//   client.setInsecure(); // skip verification
//   pbClient = new PubSubClient(client);

//   pbClient->setServer(server, 8883);
//   pbClient->setCallback(callback);
// }

// void loop()
// {
//   if (!pbClient->connected())
//   {
//     reconnect();
//   }
//   pbClient->loop();
// }