#Alzheimers Wristband
Project for developing a wristband IoT system, that will assist nursing homes in tracking Alzheimers patients.

The wristband prototype uses the ESP8266 wifi board for hosting a websocket that the server pings to get longitude and latitude. The code for this can be found in the esp8266 directory


The server aspect is developed in Meteor.JS and React.JS. It uses the Google Maps API to set a perimeter, and can visualize where the wristband is located. The system gives a notification when the device is outside of proximity. The code for this can be found in the alzhermers_wristband directory.
