'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams', '$interval', '$firebase',
        function ($scope, $location, $http, $routeParams, $interval, $firebase) {

            $scope.busStops = {};
            $scope.busStopDetails = {};
            $scope.ajaxicon = true;

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
              $scope.ajaxicon = false;
              //update the bus stop information every min
              $interval(function(){
                refreshAllStops($scope.busStops.tslink);
             }, 60000);

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
                var ans = confirm('Sure to delete this entry? User system is undergoing construction, so please do not delete entries randomly.');
                if (!ans) return;
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
                    if (data.info.Code != undefined) {
                      alert("The bus stop number is invalid via Translink API.");
                      var index = $scope.busStops.tslink.indexOf(stop);
                      $scope.busStops.tslink.splice(index,1)[0];
                      $scope.busStops.$save();
                      return;
                    }
                     //console.log(data.info); return;
                     angular.forEach(data.info, function(info) {

                        // after midnight or the early evening, the busless period may cause unhandled error
                        if (!info.Schedules[0]) {
                          console.log('FetchSingleStop: No bus will arrive at current time perioid.');
                          return;
                        }

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
                    console.log("Error when fetching stop info: " + data);
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
                     if (data.info.Code != undefined) {
                      alert("The bus stop number is invalid via Translink API.");
                      var index = $scope.busStops.tslink.indexOf(stop);
                      $scope.busStops.tslink.splice(index,1)[0];
                      $scope.busStops.$save();
                      return;
                    }

                    if (!$scope.busStopDetails[stop]) {
                      //alert("Stop doesn't exit on the busStopDetails object!");
                      return;
                    }

                     angular.forEach(data.info, function(info) {
                      // after midnight or the early evening, the busless period may cause unhandled error
                        if (!info.Schedules[0]) {
                          console.log('RefreshSingleStop: No bus will arrive at current time perioid.');
                          if ($scope.busStopDetails[stop]) {
                              var index = $scope.busStopDetails.indexOf(stop);
                              $scope.busStopDetails.splice(index,1)[0];
                          }
                          return;
                        }

                        var routeNo = info.RouteNo;
                        var dest = info.Schedules[0].Destination;
                        var countDowntime = info.Schedules[0].ExpectedCountdown;
                        var arrivalTime = info.Schedules[0].ExpectedLeaveTime;
                        //alert("Route: " + routeNo + " Destination: " + dest + " Arrives in: " + arrivalTime);
                        angular.forEach($scope.busStopDetails[stop], function(info, index) {
                            if (info.route == routeNo) {
                              //alert("Route: " + info.route + " Index: " + index);
                              $scope.busStopDetails[stop][index].dest = dest;
                              $scope.busStopDetails[stop][index].cTime = countDowntime;
                              $scope.busStopDetails[stop][index].aTime = arrivalTime;
                            }

                        });
                     });

                  }).
                  error(function(data, status, headers, config) {
                    console.log("Error when refreshSingleStop: " + stop);
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








