'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams', '$interval', '$firebase',
        function ($scope, $location, $http, $routeParams, $interval, $firebase) {

            $scope.busStops = {};
            $scope.busStopDetails = {};

            var ref = new Firebase("https://tslink.firebaseio.com/");
            var sync = $firebase(ref);

            $scope.busStops = sync.$asObject();
            var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 1, tf = 60;

            $scope.busStops.$loaded().then(function(array) {
              if ($scope.busStops.tslink == null) {
                    //alert("Null Bus Stop Object, initializing...");
                    $scope.busStops.tslink = [];
                    $scope.busStops.$save();
                  }

              fetchAllStops($scope.busStops.tslink);

              //update the bus stop information every min
              $interval(function(){
                refreshAllStops($scope.busStops.tslink);
             }, 11110000);

            });



             /*
              * Checking the validity of the user input
              */
             var checkInputStop = function(stop){
                var validity = !isNaN(stop) && (stop > 50000) && (stop <= 70000);
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
                var index = $scope.busStops.tslink.indexOf($scope.inputStop);
                if (index >= 0) {
                  alert("The bus stop has already been added.")
                  //console.log(JSON.stringify());
                  return;
                }

                $scope.busStops.tslink.push($scope.inputStop);
                $scope.busStops.$save();
                fetchSingleStop($scope.inputStop);
            };

             /*
              * Remove a bus stop to firebase, object $scope.busStops, array 'tslink'
              */
            $scope.removeStop = function(stop) {
                var index = $scope.busStops.tslink.indexOf(stop);
                $scope.busStops.tslink.splice(index,1)[0];
                $scope.busStops.$save();
                delete $scope.busStopDetails[stop];
                //console.log(JSON.stringify($scope.busStopDetails));
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

            $scope.computeArrival = function (cTime) {

                if (cTime <=0) {
                  return "Arrvied";
                }
                return "Arrive in: " + cTime + " min";
            };

            var fetchAllStops = function(stopList) {

                $scope.busStopDetails = {};
                angular.forEach(stopList, function(stop){
                  fetchSingleStop(stop);
                }); //here we done for the stoplist info fecthing
            };


            var fetchSingleStop = function(stop) {
                var stopInfo = [];
                var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
                          '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;

                $http.post('/api/handleBusStop', {data: req}).
                  success(function(data, status, headers, config) {
                    if (data.info.Code) {
                      alert("The bus stop number is invalid via Translink API.");
                      var index = $scope.busStops.tslink.indexOf(stop);
                      $scope.busStops.tslink.splice(index,1)[0];
                      $scope.busStops.$save();
                      return;
                    }
                     //console.log(data.info); return;
                     angular.forEach(data.info, function(info) {
                        var details = {};
                        var routeNo = info.RouteNo;
                        var dest = info.Schedules[0].Destination;
                        var countDowntime = info.Schedules[0].ExpectedCountdown;
                        var arrivalTime = info.Schedules[0].ExpectedLeaveTime;
                        //alert("Destination: " + dest + " Arrives in: " + arrivalTime);
                        details = {stop:stop, route:routeNo, dest:dest, cTime:countDowntime, aTime:arrivalTime};
                        stopInfo.push(details);
                        //console.log(stopInfo);
                     });
                     if ($scope.busStopDetails[stop] == null) {
                        $scope.busStopDetails[stop] = stopInfo;
                       }
                     //console.log(JSON.stringify($scope.busStopDetails));
                  }).
                  error(function(data, status, headers, config) {
                    alert("Error when fetching stop info: " + status);
                    return;
                  });
            };

            /*
             * update a single stop info in interval of 1 min
             */
            var refreshSingleStop = function(stop) {
                var stopInfo = [];
                var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
                          '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;
                $http.post('/api/handleBusStop', {data: req}).
                  success(function(data, status, headers, config) {
                    //Error handle for invalid stop number, tho not necessary here
                     if (data.info.Code) {
                      alert("The bus stop number is invalid via Translink API.");
                      var index = $scope.busStops.tslink.indexOf(stop);
                      $scope.busStops.tslink.splice(index,1)[0];
                      $scope.busStops.$save();
                      return;
                    }

                    if (!$scope.busStopDetails[stop]) {
                      alert("Stop doesn't exit on the busStopDetails object!");
                      return;
                    }

                    stopInfo = $scope.busStopDetails[stop];
                    //alert(JSON.stringify(stopInfo)); return;

                     angular.forEach(data.info, function(info) {
                      console.log(data.info); return;
                        var routeNo = info.RouteNo;
                        var dest = info.Schedules[0].Destination;
                        var countDowntime = info.Schedules[0].ExpectedCountdown;
                        var arrivalTime = info.Schedules[0].ExpectedLeaveTime;
                         alert("Route: " + routeNo + " Destination: " + dest + " Arrives in: " + arrivalTime);
                        angular.forEach(stopInfo, function(info) {



                        });
                     });

                  }).
                  error(function(data, status, headers, config) {
                    alert("Error when fetching stop info: " + status);
                    return;
                  });
            };

            /*
             * update all the stop info in interval of 1 min, by calling refreshSingleStop();
             */
            var refreshAllStops = function(stopList) {
              angular.forEach(stopList, function(stop) {
                refreshSingleStop(stop);
              });
            };


}]);








