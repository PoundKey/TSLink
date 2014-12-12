'use strict';


// Declare app level module which depends on filters, and services

var myApp = angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.controllers',
  'btford.socket-io',
  'LocalStorageModule',
]);

myApp.factory('socket.io', function (socketFactory) {
  return socketFactory();
});

myApp.value('cloudBase', {
	'API_KEY' : '8abebf20-9333-46f7-9412-a740bca4019e',
	'DEV_DB' : 'TSLinkDev',
	'PRO_DB' : 'TSLink'
});

