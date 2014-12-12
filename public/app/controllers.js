'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$http', '$interval', '$timeout', 'socket.io',
                            'localStorageService', 'cloudBase',
        function ($scope, $http, $interval, $timeout, socket, login, cloud) {

            $scope.user = login.get('user');
            $scope.coreData = {};
            var localhost = document.location.hostname == "localhost" ;
            var DB_STORE = localhost ? cloud.DEV_DB: cloud.PRO_DB;

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


            socket.on('stopInfo', function(data) {
              console.log('Bus Stop Data: ' + data);
            });

            // <----------------- end of Socket IO data exchange ---------------->



            // <---------------------- Application workflow --------------------->


            function controlFlow() {
              var OP = {TOKEN: cloud.API_KEY, DB_STORE: DB_STORE};
              socket.emit('DB_STORE', OP);
              $timeout(function() {
                getUserInfo($scope.user);
              }, 50);
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
              var memo = new Date();
              var stamp = memo.toLocaleString();

              newUser = {uid : uname, cTime: stamp};

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
             * add a bus stop number to the datastore
             * @param  {int} $scope.inputStop
             */
             $scope.addStop = function() {
              $scope.delay = true;
              var uname = $scope.username;
              var stop = $scope.inputStop;
              if (!checkInputStop(stop)){
                $scope.delay = false;
                iAlert("Oops...", "Please enter an valid bus stop number.", "warning");
                return;
              }

              socket.emit('addStop', stop, function (error, data) {

                if (error) {
                  iAlert('Oops...', error.message, 'error');
                  $scope.delay = false;
                  return;
                }
                return;
                //iAlert(data.message, "Good luck on catching the bus! Wish you enjoy TSLink.", 'success');
                //todo: configure coreData
                _.extend($scope.coreData, data);
                $scope.delay = false;
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


             // <------------------ end of helper functions ------------------->





}]);








