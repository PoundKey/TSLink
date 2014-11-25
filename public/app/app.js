'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.controllers'

]);

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


