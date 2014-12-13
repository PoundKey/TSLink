'use strict';


// Declare app level module which depends on filters, and services

var myApp = angular.module('myApp', [
  'myApp.controllers',
  'btford.socket-io',
  'LocalStorageModule',
]);

myApp.factory('socket.io', function (socketFactory) {
  return socketFactory();
});

