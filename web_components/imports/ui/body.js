import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze'

import './body.html';
import './navigation.html';

Router.route('/', function(){
    this.render('layout');
});

