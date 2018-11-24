import {Mongo} from "meteor/mongo";

export const Patients = new Mongo.Collection('Patients');

Patients.allow({
    insert() { return false; },
    update() { return false; },
    remove() { return false; },
});

Patients.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});
