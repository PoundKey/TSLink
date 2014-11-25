'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams',
        function ($scope, $location, $http, $routeParams) {

            $scope.message = undefined;
            $scope.content = undefined;


            $scope.addBusStop = function () {

                var msg = undefined;
                $http.get('/api/addBusStop')
                    .success(function (data, status, headers, config) {
                        //alert("Start analyzing Mario source code: " + msg.title + " @ " + msg.content);
                        $scope.message = "Start analyzing Mario source code...";
                        $scope.message = data.title;
                        $scope.content = data.content;
                    })
                    .error(function (data, status, headers, config) {
                        alert("Error when sending the AJAX request. ");
                    });
            };



}]);








