#include <ArduinoJson.h>

// project variables
int d2Val = 0;
int d3Val = 0;
int d4Val = 0;
int d5Val = 0;

int d2ClickCount = 0;
int d3ClickCount = 0;
int d4ClickCount = 0;
int d5ClickCount = 0;

int prevD2Val = 0;
int prevD3Val = 0;
int prevD4Val = 0;
int prevD5Val = 0;

void sendData() {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject D2 = data.createNestedObject("D2");
  JsonObject D3 = data.createNestedObject("D3");
  JsonObject D4 = data.createNestedObject("D4");
  JsonObject D5 = data.createNestedObject("D5");

  
  D2["isPressed"] = d2Val;
  D3["isPressed"] = d3Val;
  D4["isPressed"] = d4Val;
  D5["isPressed"] = d5Val;

  D2["count"] = d2ClickCount;
  D3["count"] = d3ClickCount;
  D4["count"] = d4ClickCount;
  D5["count"] = d5ClickCount;

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
  d2Val = digitalRead(2);
  d3Val = digitalRead(3);
  d4Val = digitalRead(4);
  d5Val = digitalRead(5);

  // calculate if d2 was clicked
  if (d2Val && d2Val != prevD2Val) {
    d2ClickCount++;
  }

   if (d3Val && d3Val != prevD3Val) {
    d3ClickCount++;
  }

   if (d4Val && d4Val != prevD4Val) {
    d4ClickCount++;
  }

   if (d5Val && d5Val != prevD5Val) {
    d5ClickCount++;
  }

  prevD2Val = d2Val;
  prevD3Val = d3Val;
  prevD4Val = d4Val;
  prevD5Val = d5Val;

  Serial.println(String(d2Val) + " " + d3Val+ " " + d4Val+ " " + d5Val);
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
