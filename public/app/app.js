'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.controllers',
  "firebase",
  'btford.socket-io',
  'LocalStorageModule'

]);

myApp.factory('socket.io', function (socketFactory) {
  return socketFactory();
});

myApp.value('cloudBase', ['https://ubccs.firebaseio.com/',
													'https://tslinkdev.firebaseio.com/']);

