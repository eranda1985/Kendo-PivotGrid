(function() {
  'use strict';

  angular
    .module('gulpTest7')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
