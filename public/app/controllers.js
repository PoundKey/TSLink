'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams',
        function ($scope, $location, $http, $routeParams) {

            $scope.message = undefined;
            $scope.content = undefined;


            $scope.addBusStop = function () {

                $http.post('/api/addBusStop', {data: $scope.inputStop})
                    .success(function (data, status, headers, config) {
                        $scope.message = data.title;
                        $scope.content = data.content;

                    })
                    .error(function (data, status, headers, config) {
                        alert("Error when sending the AJAX request. ");
                    });
            };



}]);








