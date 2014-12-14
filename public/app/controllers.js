'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$http', '$interval', '$timeout',
                            'socket.io', 'localStorageService',
        function ($scope, $http, $interval, $timeout, socket, login) {

            $scope.user = login.get('user');
            $scope.coreData = {};

            // <---------------------- visibility control ----------------------->
            $scope.signup = false;
            $scope.signin = false;
            $scope.delay = false;
            $scope.ajaxicon = false;
            $scope.errArray = [];
            $scope.errShow = true;

            $scope.signup_c = function() {
              $scope.signup = true;
            };

            $scope.signin_c = function() {
              $scope.signin = true;
            };

            $scope.reset = function() {
              $scope.signup = false;
              $scope.signin = false;
            }

            // <------------------- end of visibility control ------------------->

            // <--------------------- Socket IO data exchange ------------------->

            socket.on('connect', function() {
              controlFlow();
            });


            socket.on('update', function(data) {
              console.log('Bus Stop Data: ' + data);
            });

            socket.on('coreData', function(data) {
              _.extend($scope.coreData, data);
            });

            // <----------------- end of Socket IO data exchange ---------------->



            // <---------------------- Application workflow --------------------->


            function controlFlow() {
              var localhost = document.location.hostname == "localhost" ;
              if (localhost) {
                socket.emit('localhost');
              }
              getUserInfo($scope.user);

            }


            // <------------------- End of Application workflow ------------------->




            // <------------------------- core functions -------------------------->


           /**
             * called when user create an account on TSLink
             * @param {string} $scope.username
             * @return {void} success alert and login or error alert and return
             */
            $scope.createUser = function() {
              $scope.delay = true;
              var uname = $scope.username;
              var newUser;
              if (!checkUsername(uname)) {
                $scope.delay = false;
                iAlert('Oops...', "Please enter a valid username. (3~15 Characters)", 'warning');
                return;
              }

              newUser = {uid : uname, cTime: stamp()};

              socket.emit('createUser', newUser, function (error, data) {

                if (error) {
                  //console.log(error.message);
                  iAlert('Oops...', error.message, 'error');
                  $scope.delay = false;
                  return;
                }

                iAlert(data.message, "You can start adding bus stops now. Wish you enjoy TSLink.", 'success');
                $scope.delay = false;
                login.set('user', uname);
                $scope.user = uname;
                $scope.coreData = {};
              });
            };

            /**
             * login user to TSLink, given username
             * @type {string} $scope.username
             *  @return {void} successful login alert or login failure alert
             */
            $scope.loginUser = function() {
              $scope.delay = true;
              var uname = $scope.username;

              if (!checkUsername(uname)) {
                $scope.delay = false;
                iAlert('Oops...', "Please enter a valid username. (3~15 Characters)", 'warning');
                return;
              }

              socket.emit('login', uname, function (error, data) {

                if (error) {
                  //console.log(error.message);
                  iAlert('Oops...', error.message, 'error');
                  $scope.delay = false;
                  return;
                }

                iAlert(data.message, "Good luck on catching the bus! Wish you enjoy TSLink.", 'success');
                $scope.delay = false;
                login.set('user', uname);
                $scope.user = uname;
                //todo
                //$scope.coreData = {};
              });
            }


            /**
             * get user's information upon open the website
             * @param  {string} uname login('user')
             * @return {void}       store info in coreData or alert login required
             */
            function getUserInfo (uname) {

              if (uname) {
                socket.emit('backin', uname, function(error, data) {
                  if (error) console.log(error.message);
                  if (data) console.log(data.message);
                });
              } else {
                $timeout(function() {
                  sweetAlert({
                     title: "Welcome!",
                     text: "Please log in or sign up before proceeding.",
                     allowOutsideClick: true,
                     imageUrl: "images/tslink2.png",
                     imageSize: "120x120",
                     timer: 3000
                  })
                }, 3000);
              }
            } // end of getUserInfo();

            /**
             * add a bus stop number to the datastore
             * @param  {int} $scope.inputStop
             */
             $scope.addStop = function() {
              $scope.delay = true;
              var uname = $scope.username;
              var stop = $scope.inputStop;
              var uInfo; //updated info
              var keys = _.keys($scope.coreData)
              if (!checkInputStop(stop)){
                $scope.delay = false;
                iAlert("Oops...", "Please enter an valid bus stop number.", "warning");
                $scope.inputStop = null;
                return;
              }

              if (_.contains(keys, stop)) {
                $scope.delay = false;
                scope.inputStop = null;
                iAlert("Oops...",
                  "The bus stop has already been added.",
                  "warning");
                return;
              }
              if (keys.length > 5) {
                $scope.delay = false;
                iAlert("Oops...",
                  "Sorry, you have reached the maxium number of stops can be added for now. Remove some of them before proceeding.",
                  "warning");
                $scope.inputStop = null;
                return;
              }
              uInfo = {stop:stop, cTime:stamp()};
              socket.emit('addStop', uInfo, function (error, data) {

                if (error) {
                  iAlert('Oops...', error.message, 'error');
                  $scope.delay = false;
                  $scope.inputStop = null;
                  return;
                }
                //iAlert(data.message, "Good luck on catching the bus! Wish you enjoy TSLink.", 'success');
                //todo: configure coreData, data is a stop object
                //example: data => { '59844': [ { route: '003', dest: 'DOWNTOWN', cTime: 10, aTime: '8:27pm' } ] }
                _.extend($scope.coreData, data);
                $scope.delay = false;
                $scope.inputStop = null;
                //console.log($scope.coreData);
              });
            };

            /**
             * remove a bus stop number to the datastore
             * @param  {int} stop number
             */
            $scope.remove = function (stop) {
              //todo
              removal($scope.coreData, stop);
              socket.emit('remove', stop, function (error) {
                if (error) {
                  iAlert('Oops...', error.message, 'error');
                  return;
                }
              });
            };


            // <--------------------- end of core functions ------------------->





            // <---------------------- helper functions ----------------------->

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

            /**
             * Computer the arrival time according to the return value
             * @param cTime
             * @returns {string}
             */
              $scope.compute = function (cTime) {

                  if (cTime == 'N/A')
                    return 'Delay';
                  if (cTime <=0)
                    return "Arrvied Now";
                  return "Arrive in: " + cTime + " min";
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

            /**
             * logout the user, if logged in
             * @return login.set('user', undefined);
             */
            $scope.logout = function() {
                if ($scope.user) {
                $scope.user = null;
                login.set('user', undefined);
              }
            }

             /*
              * Checking the validity of the user input
              */
             function checkInputStop(stop){
                var validity = !isNaN(stop) && (stop > 50000) && (stop <= 70000);
                return validity;
             };

             /**
              * remove the property with key pf 'stop' from the obj object
              * @param  {object} obj  example: $scope.coreData
              * @param  {int} stop
              * @return {void}
              */
             function removal (obj, stop) {
               var keys = _.keys(obj);
               if (!_.contains(keys, stop)) return;
               delete obj[stop];
             }

             /**
              * create a timeStamp from current user
              * @return {date}
              */
              function stamp() {
                var memo = new Date();
                var stamp = memo.toLocaleString();
                return stamp;
              }

             // <------------------ end of helper functions ------------------->





}]);








