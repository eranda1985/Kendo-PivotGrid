(function() {
  'use strict';

  angular.module('gulpTest7')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/main', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      }).otherwise({
          redirectTo: '/main'
      });
  }

})();
