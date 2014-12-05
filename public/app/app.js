'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.controllers',
  "firebase"

]);

myApp.factory('socket.io', function ($rootScope) {
  var socket = io();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

/**

myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	// if(window.history && window.history.pushState){
	// 	$locationProvider.html5Mode(true);
	// }
  $routeProvider.when('/', {templateUrl: 'partials/overview.html', controller: 'AppCtrl'});
  $routeProvider.when('/res/:id', {templateUrl: 'partials/data-template.html', controller: 'DataCtrl'});
  $routeProvider.when('/profile', {templateUrl: 'partials/profile.html', controller: 'ProfileCtrl'});
  $routeProvider.when('/chat', {templateUrl: 'partials/chat.html', controller: 'ChatCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

*/


