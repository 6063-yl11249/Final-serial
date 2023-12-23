#include <ArduinoJson.h>

// project variables
int buttonState2 = 0;
int buttonState3 = 0;
int buttonState4 = 0;
int buttonState5 = 0;


void sendData() {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject D2 = data.createNestedObject("D2");
  JsonObject D3 = data.createNestedObject("D3");
  JsonObject D4 = data.createNestedObject("D4");
  JsonObject D5 = data.createNestedObject("D5");

  
  D2["value"] = buttonState2;
  D3["value"] = buttonState3;
  D4["value"] = buttonState4;
  D5["value"] = buttonState5;

  String resTxt = "";
  serializeJson(resJson, resTxt);

  Serial.println(resTxt);
}

void setup() {
  // Serial setup
  Serial.begin(9600);
  while (!Serial) {}
}

void loop() {
  // read pins
  buttonState2 = digitalRead(2);
  buttonState3 = digitalRead(3);
  buttonState4 = digitalRead(4);
  buttonState5 = digitalRead(5);

  // check if there was a request for data, and if so, send new data
  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) {
      Serial.flush();
      sendData();
    }
  }

  delay(2);
}