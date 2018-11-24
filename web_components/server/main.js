import { Meteor } from 'meteor/meteor';
import { Patients } from "../imports/api/patients";
import { HTTP } from 'meteor/http'

Meteor.startup(() => {
    async function locationRequest (callback){
        try {
            let result = await HTTP.call('GET', 'http://192.168.0.100/', );
            Patients.upsert({"PatientID":result.content.patient},{$set:JSON.parse(result.content)});
        }catch (e){
            console.log(e.message);
        }
    }
    function constant(){
        locationRequest().then(constant);
    }
    constant();
});
