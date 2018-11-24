import { Meteor } from 'meteor/meteor';
import { Patients } from "../imports/api/patients";


Meteor.methods({
    PatientsInfo: (PatientID) => {
        return Patients.findOne({"PatientID" : PatientID});
    }
});