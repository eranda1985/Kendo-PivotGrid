'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:dashboardCtrl
 * @description
 * # dashboardCtrl
 * Controller of the dashboard
 */



angular
    .module('dashboard', ['kendo.directives', 'adf', 'adf.structures.base', 'adf.widget.clock'
        ,'adf.widget.ErandaWidget'])

    .config(function config($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: 'app/dashboard/dashboard.html',
                controller: 'dashboardCtrl'
            });
    })
    .factory("dashboardFactory", ['ErandaWidgetFactory', function (ErandaWidgetFactory) {
        return{

            init: function () {
                console.log("Dashboard Factory");

            }
        };
    }])
    .controller('dashboardCtrl', ["$scope", "dashboardFactory",
        function ($scope, dashboardFactory) {
            console.log("this is a test");
            $scope.$on('adfWidgetAdded',function(event,name,model,widget){
                console.log('adfWidgetAdded',widget.type);
                if(widget.type === 'ErandaWidget'){

                }
            });

        }]);
