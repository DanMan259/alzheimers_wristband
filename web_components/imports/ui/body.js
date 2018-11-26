import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './body.html';
import './map.html'
import './navigation.html';
import { Patients } from "../api/patients";
import geolib from 'geolib';

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


    Template.map.onRendered(function() {
        var self = this;

        GoogleMaps.ready('map', function (map) {
            var marker;
            var circle;


            // Create and move the marker when latLng changes.
            self.autorun(function () {
                var latLng = Geolocation.latLng();
                if (!latLng)
                    return;

                // If the marker doesn't yet exist, create it.
                //if (!marker) {


                google.maps.event.addListener( map.instance, 'click', function(event) {
                       // marker2 = new google.maps.Marker({
                         //   position: event.latLng,
                           // map: map.instance});
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                        draggable: true

                    });
                    marker.setPosition(event.latLng)
                    console.log(event.latLng.lng());

                    console.log(('Within Radius: ' + geolib.isPointInCircle({latitude:event.latLng.lat(),longitude:event.latLng.lng()}, {
                        latitude: 44.227919299999996,
                        longitude: -76.49169979999999
                    }, 50)));
                    circle = new google.maps.Circle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: map.instance,
                        center: event.latLng,
                        radius: 50
                    });
                });
                //}
                // The marker already exists, so we'll just change its position.
                //else {
                //    marker.setPosition(latLng);
                }
                //map.instance.setZoom(15);
                /*function distance(position) {
                    alert('Within Radius: ' + geolib.isPointInCircle(position.coords, {
                        latitude: 51.525,
                        longitude: 7.4575
                    }, 300000));
                }*/
            );
        });



    });



    Template.map.helpers({
        geolocationError: function () {
            var error = Geolocation.error();
            return error && error.message;
        },
        mapOptions: function () {
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

    Router.route('/', function () {
        this.render('layout');
    })
    /*
    //THIS IS THE DISTANCE FUNCTION

*/
