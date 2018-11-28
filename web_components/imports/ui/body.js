import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session'

import './body.html';
import './map.html';
import './navigation.html';
import './patientInfo.html';
import { Patients } from "../api/patients";
import geolib from 'geolib';

var value = 0;
var patient= new ReactiveVar({});

Template.registerHelper('clicked', function() {
    return ((Session.get("clicked") === 1)? 1 : 0);
});

Template.registerHelper('patientData', function() {
    const instance = Template.instance();
    return instance.patient.get();
});

Template.patientInfo.onCreated(function autoRun(){
    var self=this;
    this.patient = new ReactiveVar();
    this.autorun(function () {
        self.patient.set(Session.get('patient'));
    })
});


Template.layout.onCreated(
    function bodyOnCreated(){
        GoogleMaps.load({ key: 'AIzaSyDZ60Qi5X41reUhEIcAmyvJD7EKdmsr9vs' });
        Meteor.subscribe('PatientsInfo');
    });



Template.contents.events({
    'submit .form-radius': function(event){
        event.preventDefault();
        value = parseFloat(event.target.radius.value);
    }
});

Template.map.onRendered(function() {
    var self = this;

    function perimeterCheck(PatientCoord ,PerimeterCenter){
        return geolib.isPointInCircle(PatientCoord,PerimeterCenter, value)
    }


    GoogleMaps.ready('map', function (map) {
        var marker=[];
        var patientMarker = [];
        var circle = [];
        var patientRadius = [];
        var patientLat = ((Patients.find().fetch()[0].location.Coordinates.Latitude)/1000000);
        var patientLong= ((Patients.find().fetch()[0].location.Coordinates.Longitude)/1000000);
        var i = 0,j = 0;


        // Create and move the marker when latLng changes.
        self.autorun(function () {
                var latLng = Geolocation.latLng();
                var radiusValue=Patients.find().fetch()[0].location.Accuracy;
                var time = Patients.find().fetch()[0].time;

                if (!latLng)
                    return;
                if(j!=0) {
                    patientMarker[j].setMap(null);
                    //patientRadius[j].setMap(null);
                }
                j++;

                patientMarker[j] = new google.maps.Marker({
                    position: new google.maps.LatLng(patientLat, patientLong),
                    map: map.instance,
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    },
                });
                /*patientRadius[j] = new google.maps.Circle({
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000ff',
                    fillOpacity: 0.35,
                    map: map.instance,
                    center: new google.maps.LatLng(((Patients.find().fetch()[0].location.Coordinates.Latitude)/1000000), (Patients.find().fetch()[0].location.Coordinates.Longitude)/1000000),
                    radius:radiusValue
                });*/

                Session.set('patient',{
                    PatientID:(Patients.find().fetch()[0].PatientID),
                        time:(new Date(time*1000)),
                        latitude:patientLat,
                        longitude:patientLong,
                        accuracy: radiusValue,
                        initialChange: false,
                        PerimeterRadius: null,
                        perimeter:false,
                });

                // If the marker doesn't yet exist, create it.

                google.maps.event.addListener( map.instance, 'click', function(event) {
                    if(i!=0) {
                        marker[i].setMap(null);
                        circle[i].setMap(null);
                    }
                    i++;
                    Session.set("clicked", 1);
                    marker[i] = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                    });
                    marker[i].setPosition(event.latLng);
                    circle[i] = new google.maps.Circle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: map.instance,
                        center: event.latLng,
                        radius:value
                    });

                    Session.set('patient',{
                        PatientID:(Patients.find().fetch()[0].PatientID),
                        time:(new Date(time*1000)),
                        latitude:patientLat,
                        longitude:patientLong,
                        accuracy: radiusValue,
                        initialChange: true,
                        PerimeterRadius: value,
                        perimeter:(perimeterCheck({
                            latitude:patientLat,
                            longitude: patientLong},{
                            latitude:event.latLng.lat(),
                            longitude:event.latLng.lng()
                        })),
                    });
                });
            }
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
});