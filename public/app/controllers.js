'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams', '$interval',
                            '$timeout', 'socket.io', 'localStorageService', 'cloudBase',
        function ($scope, $location, $http, $routeParams, $interval,
                                $timeout, socket, login, cloud) {

            $scope.user = login.get('user');

            var localhost = document.location.hostname == "localhost" ;
            var sqlBase = localhost ? cloud[1]: cloud[0];


            $scope.busStops = {};
            $scope.busStopDetails = {};
            $scope.ajaxicon = true;

            //getUserInfo($scope.user);
            mockup();

            $scope.enterUser = function() {
              var uname = $scope.username;
              var newUser = {};
              if (!checkUsername(uname)) {
                iAlert('Oops...', "Please enter a valid username. (3~15 Characters)", 'warning');
                return;
              }

              var uDict = rootDB.users;
              var uArray = _.keys(uDict);
              console.log(uArray);
              if (_.contains(uArray, uname)) {
                iAlert('Not Available.', "Please choose another username. (3~15 Characters)", 'warning');
                return;
              }

              var memo = new Date();
              var stamp = memo.toLocaleString();
              newUser[uname] = stamp;
              _.extend(uDict, newUser);
              if (rootDB.$save()) {
                iAlert('Welcome, ' + uname + '!', "You can start adding bus stops now.", 'success');
              } else {
                iAlert('Oops...', "Something went wrong, please check the internet connection.", 'error');
              }

              return;


            };


            socket.on('connect', function() {

              socket.emit('fetchStop', 59844);

            });

            socket.on('stopInfo', function(data) {
              console.log('Bus Stop Data: ' + data);
            });

            /**
             * errArray: Array that holds all the error messages.
             * @type {Array}
             */
            $scope.errArray = [];
            $scope.errShow = true;

            var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 1, tf = 60;

            $scope.busStops.$loaded().then(function(array) {
              if ($scope.busStops.tslink == null) {
                    //alert("Null Bus Stop Object, initializing...");
                    $scope.busStops.tslink = [];
                    $scope.busStops.$save();
                  }

              //console.log($scope.busStops);
              fetchAllStops($scope.busStops.tslink);

              $scope.ajaxicon = false;
              $timeout(function() {
                $('.err').addClass('fadeOutUp');
                $timeout(function(){
                  $scope.errShow = false;
                }, 500);
              }, 5000);
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
                if (!checkInputStop($scope.inputStop)){
                    //swal('Please enter an valid bus stop number.');
                    sweetAlert({title: "Oops...",
                                text: "Please enter a valid bus stop number.",
                                type: "warning", allowOutsideClick:true});
                    return;
                }

                if ($scope.busStops.tslink == null) {
                    $scope.busStops.tslink = [];
                    $scope.busStops.$save();
                }

                var index = $scope.busStops.tslink.indexOf($scope.inputStop);
                if (index > -1) {
                  sweetAlert({title: "Oops...",
                              text: "The bus stop has already been added.",
                              type: "warning", allowOutsideClick:true});

                  //console.log(JSON.stringify());
                  return;
                }

                fetchSingleStop($scope.inputStop);
            };


            var fetchAllStops = function(stopList) {
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
                    if (data.info.Code == 3002) {
                      //alert("The bus stop number is invalid via Translink API.");
                      sweetAlert({title: "Oops...",
                              text: "The bus stop number is invalid via Translink API.",
                              type: "warning", allowOutsideClick:true});
                      return;
                    } else if (data.info.Code) {
                      //console.log("Error Code: " + data.info.Code);
                      var err = "Bus Stop " + stop + ": " + data.info.Message;
                      $scope.errArray.push(err);

                      var index = $scope.busStops.tslink.indexOf(stop);

                      if (index < 0) {
                        $scope.busStops.tslink.push(stop);
                        $scope.busStops.$save();
                      }
                      return;
                    }

                    var index = $scope.busStops.tslink.indexOf(stop);
                    if (index < 0) {
                      $scope.busStops.tslink.push(stop);
                      $scope.busStops.$save();
                    }
                     //console.log(data.info); return;
                     angular.forEach(data.info, function(info) {
                        // after midnight or the early earlyevening, the busless period may cause unhandled error
                        if (info.Schedules == undefined) {
                          alert('Stop ' + stop + ': No bus will arrive at current time perioid.');
                          return;
                        }

                        var details = {};
                        var routeNo = info.RouteNo || 'N/A';
                        var dest = info.Schedules[0].Destination || 'N/A';
                        var countDowntime = info.Schedules[0].ExpectedCountdown || 'N/A';
                        var arrivalTime = info.Schedules[0].ExpectedLeaveTime || 'N/A';
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
              * Remove a bus stop to firebase, object $scope.busStops, array 'tslink'
              */
            $scope.removeStop = function(stop) {
              sweetAlert({title: "Are you sure?",
                text: "User system is undergoing construction, so please do not delete entries randomly.",
                type: "info", allowOutsideClick:true, showCancelButton: true, confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm", closeOnConfirm: false
                }, function(ans){
                  if (ans){
                    var index = $scope.busStops.tslink.indexOf(stop);
                    $scope.busStops.tslink.splice(index,1);
                    $scope.busStops.$save();
                    delete $scope.busStopDetails[stop];
                    sweetAlert("Deleted!", "The bus stop entry has been deleted.", "success");
                  }
                });
            };

          /**
           * Computer the arrival time according to the return value
           * @param cTime
           * @returns {string}
           */
            $scope.computeArrival = function (cTime) {

                if (cTime == 'N/A')
                  return 'Delay';
                if (cTime <=0)
                  return "Arrvied Now";
                return "Arrive in: " + cTime + " min";
            };


            /*
             * update a single stop info in interval of 1 min
             */
            var refreshSingleStop = function(stop) {
              //alert("Refreshing Stop: " + stop);
                var stopInfo = [];
                var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
                          '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;
                $http.post('/api/handleBusStop', {data: req}).
                  success(function(data, status, headers, config) {
                    //Error handle for invalid stop number, tho not necessary here
                    /*
                     if (data.info.Code == 3002) {
                      alert("The bus stop number is invalid via Translink API.");
                      var index = $scope.busStops.tslink.indexOf(stop);
                      $scope.busStops.tslink.splice(index,1)[0];
                      $scope.busStops.$save();
                      return;
                    } else if (data.info.Code) {
                      alert("Bus Stop " + stop + ": " + data.info.Message);
                      return;
                    }
                    */
                   if (data.info.Code) {
                      //console.log("Bus Stop " + stop + ": " + data.info.Message);
                      return;
                    }

                    if (!$scope.busStopDetails[stop]) {
                      //alert("Stop doesn't exit on the busStopDetails object!");
                      return;
                    }

                     angular.forEach(data.info, function(info) {
                      // after midnight or the early evening, the busless period may cause unhandled error
                        if (info.Schedules == undefined) {
                          console.log('RefreshSingleStop: No bus will arrive at current time perioid.');
                          if ($scope.busStopDetails[stop]) {
                              var index = $scope.busStopDetails.indexOf(stop);
                              $scope.busStopDetails.splice(index,1);
                          }
                          return;
                        }

                        var routeNo = info.RouteNo || 'N/A';
                        var dest = info.Schedules[0].Destination || 'N/A';
                        var countDowntime = info.Schedules[0].ExpectedCountdown || 'N/A';
                        var arrivalTime = info.Schedules[0].ExpectedLeaveTime || 'N/A';
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


            /**
             * Trim the date and time format return from the api with time only
             * @param  {date} aTime
             * @return {time}
             */
            $scope.timeConf = function (aTime) {
              var spaceIndex = aTime.indexOf(' ')
              var time = spaceIndex < 0 ? aTime : aTime.substr(0,aTime.indexOf(' '));
              return time;
            };

            $scope.flipSide = function() {
              if ($scope.user) {
                $scope.user = null;
                login.set('user', undefined);
              }
            };

            function getUserInfo (uname) {

              if (uname) {
                ref = new Firebase(fbase);
                sync = $firebase(ref);
                main = sync.$asObject();
                fbInit(main);
                buslist = main.api[uname];
              } else {
                $timeout(function() {
                  sweetAlert({
                     title: "Welcome!",
                     text: "Please create a username before proceeding.",
                     allowOutsideClick: true,
                     imageUrl: "images/tslink2.png",
                     imageSize: "120x120",
                     timer: 10000
                  })
                }, 3000);
              }
            } // end of getUserInfo();

            /**
             * Acess firebase cloud storage
             * @return {object} root object
             */
            function accessCloud () {
              var ref = new Firebase(fbase);
              var sync = $firebase(ref);
              return sync.$asObject();
            }

            function fbInit (sync) {
              if (!sync.users) {
                sync.users = {info : '$init'};
                sync.$save();
              };
              if (!sync.api) {
                sync.api = {info : '$init'};
                sync.$save();
              }
            }//end of fbInit()

            function iAlert (title, msg, type) {
              sweetAlert({
                 title: title,
                 text: msg,
                 type: type,
                 allowOutsideClick: true,
              });
            }//end of iAlert()

            function checkUsername (uname) {
                var validity = _.isString(uname) && (uname.length >=3) && (uname.length <=15);
                return validity;             // body...
            }




}]);








