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
#include <Hash.h>

ESP8266WiFiMulti WiFiMulti;

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

//Credentials for Google GeoLocation API...
const char* Host = "www.googleapis.com";
String thisPage = "/geolocation/v1/geolocate?key=";
String key ="";

char myssid[] = "TP-LINK_5BC8";         // your network SSID (name)
char mypass[] = "09918467";          // your network password

double latitude    = 0.0;
double longitude   = 0.0;
double accuracy    = 0.0;

String jsonString = "{\n";


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);

            // send message to client
            webSocket.sendTXT(num, "{ patient : 0001 , location : { longitude: " + (String)longitude + " , latitude: " +  (String)latitude + " , accuracy: " + (String)accuracy + " }}");
        }
            break;
            /*
        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);
            if(payload[0] == '#') {
                // we get RGB data

                // decode rgb data
                uint32_t rgb = (uint32_t) strtol((const char *) &payload[1], NULL, 16);

                analogWrite(LED_RED, ((rgb >> 16) & 0xFF));
                analogWrite(LED_GREEN, ((rgb >> 8) & 0xFF));
                analogWrite(LED_BLUE, ((rgb >> 0) & 0xFF));
            }

            break;*/
    }
}



void setup() {
    Serial.begin(115200);
    
    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    WiFiMulti.addAP("TP-LINK_5BC8", "09918467");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    // start webSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    if(MDNS.begin("esp8266")) {
        Serial.println("MDNS responder started");
    }

    // handle index
    server.on("/", []() {
        // send index.html
        server.send(200, "text/html", "{ patient : 0001 , location : { longitude: " + (String)longitude + " , latitude: " +  (String)latitude + " , accuracy: " + (String)accuracy + " }}");
    });

    server.begin();

    // Add service to MDNS
    MDNS.addService("http", "tcp", 80);
    MDNS.addService("ws", "tcp", 81);

}

unsigned long last_10sec = 0;
unsigned int counter = 0;

void loop() {
    unsigned long t = millis();
    int n = WiFi.scanNetworks();
    DynamicJsonBuffer jsonBuffer;
    WiFiClientSecure client;
    webSocket.loop();
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
        latitude    = root["location"]["lat"];
        longitude   = root["location"]["lng"];
        accuracy   = root["accuracy"];
      }
    }
    
    if((t - last_10sec) > 10 * 1000) {
        counter++;
        bool ping = (counter % 2);
        int i = webSocket.connectedClients(ping);
        Serial.printf("%d Connected websocket clients ping: %d\n", i, ping);
        Serial.print("Latitude = ");
        Serial.println(latitude, 6);
        Serial.print("Longitude = ");
        Serial.println(longitude, 6);
        Serial.print("Accuracy = ");
        Serial.println(accuracy);
        last_10sec = millis();
    }
}
