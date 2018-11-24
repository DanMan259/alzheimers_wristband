import { Meteor } from 'meteor/meteor';
import { Patients } from "../imports/api/patients";


Meteor.methods({
    PatientsInfo: () => {
        return Patients.find({PatientID:1});
    }
});