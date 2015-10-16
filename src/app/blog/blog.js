'use strict';

/**
 * @ngdoc function
 * @name blog.controller:blogCtrl
 * @description
 * # blogCtrl
 * Controller of the blog
 */

angular
.module('blog',[])

.config(function config($routeProvider) {
  $routeProvider
    .when('/blog', {
      templateUrl: 'app/blog/blog.html',
      controller: 'blogCtrl'
    });
})

.controller('blogCtrl', function blogCtrl($scope) {

});
