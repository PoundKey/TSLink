'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams', '$interval', '$firebase',
        function ($scope, $location, $http, $routeParams, $interval, $firebase) {

            $scope.busStops = [];
            $scope.busStopDetails = [];

            var ref = new Firebase("https://tslink.firebaseio.com/");
            var sync = $firebase(ref);
            var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 1, tf = 60;

            $scope.busStops = sync.$asObject();

            $scope.busStops.$loaded().then(function(array) {
                if ($scope.busStops.tslink == null) {
                    //alert("Null Bus Stop Object, initializing...");
                    $scope.busStops.tslink = [];
                    $scope.busStops.$save();
                }

                var stopList = $scope.busStops.tslink;
                angular.forEach(stopList, function(stop){

                    var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
                              '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;

                    $http.post('/api/addBusStop', {data: req}).
                      success(function(data, status, headers, config) {
                        console.log(data); return;
                         var stopInfo = {};
                         angular.forEach(data, function(info) {
                            var dest = info.Schedules[0].Destination;
                            var arrivalTime = info.Schedules[0].ExpectedCountdown;
                            alert("Destination: " + dest + " Arrives in: " + arrivalTime);

                         });

                      }).
                      error(function(data, status, headers, config) {
                        alert("Error when fetching stop info: " + status);
                        return;
                      });

                });
            });

            $scope.$watch('busStops',function(newVal, oldVal){

            });

              /*
              *  Each minute the turner switches between 0 and 1,
              *  and the new bus arrival time is refreshed.
              */
            $scope.turner = 0;
             $interval(function(){
                ($scope.turner == 0) ? $scope.turner = 1 : $scope.turner = 0;
             }, 3000);

             /*
              * Checking the validity of the user input
              */
             var checkInputStop = function(stop){
                var validity = !isNaN(stop) && (stop > 9999) && (stop <= 99999);
                return validity;
             };

             /*
              * Add a bus stop to firebase, object $scope.busStops, array 'tslink'
              */

            $scope.addBusStop = function () {
                if (checkInputStop($scope.inputStop) == false){
                    alert('Please enter an valid bus stop number.')
                    return;
                }
                $scope.busStops.tslink.push($scope.inputStop);
                $scope.busStops.$save();
            };

             /*
              * Remove a bus stop to firebase, object $scope.busStops, array 'tslink'
              */
            $scope.removeStop = function(stop) {
                var index = $scope.busStops.tslink.indexOf(stop);
                $scope.busStops.tslink.splice(index,1)[0];
                $scope.busStops.$save();
            };



            $scope.addBusStopViaSQL = function () {

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








