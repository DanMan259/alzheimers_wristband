/*
 * WebSocketServerAllFunctionsDemo.ino
 *
 *  Created on: 10.05.2018
 *
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <NTPClient.h>
#include <Hash.h>

#define NTP_OFFSET   60 * 60      // In seconds
#define NTP_INTERVAL 60 * 1000    // In miliseconds
#define NTP_ADDRESS  "europe.pool.ntp.org"

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, NTP_ADDRESS, NTP_OFFSET, NTP_INTERVAL);

ESP8266WiFiMulti WiFiMulti;

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

//Credentials for Google GeoLocation API...
const char* Host = "www.googleapis.com";
String thisPage = "/geolocation/v1/geolocate?key=";
String key = "AIzaSyDgCtMzBVCRWu0N9Hy4Vd5Mj5LMc87eYRA";

//char myssid[] = "TP-LINK_5BC8";         // your network SSID (name)
//char mypass[] = "09918467";          // your network password

char myssid[] = "TP-LINK_5BC8";         // your network SSID (name)
char mypass[] = "09918467";          // your network password


double latitude    = 0.0;
double longitude   = 0.0;
double accuracy    = 0.0;

String jsonString = "{\n";
String jsonResponse = "{}";

void setup() {
    Serial.begin(115200);
    
    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    WiFiMulti.addAP(myssid, mypass);

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }
    timeClient.begin();

    // handle index
    server.on("/", []() {
        // send index.html
        server.send(200, "text/json", jsonResponse );
    });

    server.begin();

    // Add service to MDNS
    MDNS.addService("http", "tcp", 80);
}

unsigned long last_10sec = 0;


void loop() {
    timeClient.update();
    unsigned long t = millis();
    unsigned long epcohTime =  timeClient.getEpochTime();
    int n = WiFi.scanNetworks();
    DynamicJsonBuffer jsonBuffer;
    WiFiClientSecure client;
    server.handleClient();

    jsonString = "{\n";
    jsonString += "\"homeMobileCountryCode\": 302,\n"; // this is a real UK MCC
    jsonString += "\"homeMobileNetworkCode\": 720,\n";  // and a real UK MNC
    jsonString += "\"radioType\": \"gsm\",\n";         // for gsm
    jsonString += "\"carrier\": \"Rogers AT&T Wireless\",\n";      // associated with Vodafone
    jsonString += "\"wifiAccessPoints\": [\n";
    for (int j = 0; j < n; ++j)
    {
      jsonString += "{\n";
      jsonString += "\"macAddress\" : \"";
      jsonString += (WiFi.BSSIDstr(j));
      jsonString += "\",\n";
      jsonString += "\"signalStrength\": ";
      jsonString += WiFi.RSSI(j);
      jsonString += "\n";
      if (j < n - 1)
      {
        jsonString += "},\n";
      }
      else
      {
        jsonString += "}\n";
      }
    }
    jsonString += ("]\n");
    jsonString += ("}\n");

    if (client.connect(Host, 443)) {
      client.println("POST " + thisPage + key + " HTTP/1.1");
      client.println("Host: " + (String)Host);
      client.println("Connection: close");
      client.println("Content-Type: application/json");
      client.println("User-Agent: Arduino/1.0");
      client.print("Content-Length: ");
      client.println(jsonString.length());
      client.println();
      client.print(jsonString);
      delay(500);
    }

    //Read and parse all the lines of the reply from server
    while (client.available()) {
      String line = client.readStringUntil('\r');
      JsonObject& root = jsonBuffer.parseObject(line);
      if (root.success()) {
        latitude    = float(root["location"]["lat"])*1000000.0;
        longitude   = float(root["location"]["lng"])*1000000.0;
        accuracy   = root["accuracy"];
      }
    }
  
    jsonResponse = "{\"PatientID\":1,\"time\":"+ (String)epcohTime +",\"location\":{\"Coordinates\":{\"Longitude\":" + (String)longitude + ",\"Latitude\":" + (String)latitude + "},\"Accuracy\" : " + (String)accuracy + "}}";
    Serial.println(jsonResponse);
}
