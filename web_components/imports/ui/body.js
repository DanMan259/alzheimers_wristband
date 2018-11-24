import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './body.html';
import './map.html'
import './navigation.html';
import { Patients } from "../api/patients";


Template.layout.onCreated(
    function bodyOnCreated(){
        GoogleMaps.load({ key: 'AIzaSyDZ60Qi5X41reUhEIcAmyvJD7EKdmsr9vs' });
        Meteor.subscribe('PatientsInfo');
});

Template.layout.helpers({
    PatientInfo(){
        console.log(Patients.find().fetch());
    },
});

Template.map.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
        var marker;

        // Create and move the marker when latLng changes.
        self.autorun(function() {
            var latLng = Geolocation.latLng();
            if (! latLng)
                return;

            // If the marker doesn't yet exist, create it.
            if (! marker) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(latLng.lat, latLng.lng),
                    map: map.instance
                });
            }
            // The marker already exists, so we'll just change its position.
            else {
                marker.setPosition(latLng);
            }

            // Center and zoom the map view onto the current position.
            map.instance.setCenter(marker.getPosition());
            map.instance.setZoom(15);
        });
    });
});

Template.map.helpers({
    geolocationError: function() {
        var error = Geolocation.error();
        return error && error.message;
    },
    mapOptions: function() {
        var latLng = Geolocation.latLng();
        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: 15
            };
        }
    }
});
    /*
    //THIS IS THE DISTANCE FUNCTION
 import geolib from 'geolib';
navigator.geolocation.getCurrentPosition(
    function (position) {
        alert('Within Radius: ' + geolib.isPointInCircle(position.coords, {
            latitude: 51.525,
            longitude: 7.4575
        }, 300));
    },
    function () {
        alert('Position could not be determined.')
    },
    {
        enableHighAccuracy: true
    }
)
*/
Router.route('/', function(){
    this.render('layout');
});
