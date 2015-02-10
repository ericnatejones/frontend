'use strict';

angular.module('myApp.addMember', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/add_member', {
            templateUrl: 'add_member/add_member.html',
            controller: 'AddMemberCtrl'
        });
    }])

    .controller('AddMemberCtrl', ['$scope', 'Restangular', '$location', function ($scope, Restangular, $location) {

        // Add a new event, alert the user when it's been created or when there was a problem.
        $scope.addMember = function () {

            var newMember = {
                name: $scope.newMemberName
            };

            Restangular.all('add_member').customPOST(newMember).then(function () {
                    alert("Your member was successfully added");
                    $location.path('/members');
                },
                function () {
                    alert("There was a problem creating your member. Please try again.")
                })
        };
    }]);