'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', '$location', '$http', '$routeParams', '$interval',
                            '$timeout', 'socket.io', 'localStorageService', 'cloudBase',
        function ($scope, $location, $http, $routeParams, $interval,
                                $timeout, socket, login, cloud) {

            $scope.user = login.get('user');
            $scope.delay = false;

            var localhost = document.location.hostname == "localhost" ;
            var DB_STORE = localhost ? cloud.DEV_DB: cloud.PRO_DB;

            $scope.coreData = {};
            $scope.ajaxicon = false;

            socket.on('connect', function() {
              socket.emit('DB_STORE', {TOKEN: cloud.API_KEY, DB_STORE: DB_STORE});
            });

            getUserInfo($scope.user);

            /**
             * called when user create an account or login to TSLink
             * @param {string} $scope.username
             * @return {void} success alert and login or error alert and return
             */
            $scope.enterUser = function() {
              $scope.delay = true;
              var uname = $scope.username;
              var newUser;
              if (!checkUsername(uname)) {
                iAlert('Oops...', "Please enter a valid username. (3~15 Characters)", 'warning');
                return;
              }
              var memo = new Date();
              var stamp = memo.toLocaleString();

              newUser = {uid : uname, cTime: stamp};

              socket.emit('createUser', newUser, function (error, data) {

                if (error) {
                  console.log(error.message);
                  iAlert('Not Available.', "Please choose another username. (3~15 Characters)", 'warning');
                  $scope.delay = false;
                  return;
                }

                iAlert(data.message, "You can start adding bus stops now.", 'success');
                $scope.delay = false;
                //login.set('user', uname);
                // maybe construct the coreData object =>

              });
            };



            socket.on('stopInfo', function(data) {
              console.log('Bus Stop Data: ' + data);
            });

            /**
             * errArray: Array that holds all the error messages.
             * @type {Array}
             */
            $scope.errArray = [];
            $scope.errShow = true;

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

            /**
             * get user's information upon open the website
             * @param  {string} uname login('user')
             * @return {void}       store info in coreData or alert login required
             */
            function getUserInfo (uname) {

              if (uname) {
                socket.emit('login', uname);
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








