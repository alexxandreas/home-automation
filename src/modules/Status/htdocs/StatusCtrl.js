(function () {
    "use strict";
    angular.module('WebApp')
        .controller('StatusCtrl', StatusCtrl);

    StatusCtrl.$inject = [
        '$scope',
        '$rootScope',
        '$http',
        '$timeout',
        '$window',
        '$sce',
        '$mdDialog',
        'StatusSrv'
    ];

    function StatusCtrl(
        $scope,
        $rootScope,
        $http,
        $timeout,
        $window,
        $sce,
        $mdDialog,
        StatusSrv
    ) {
        // $scope.statusData = "";
        // reload();

        // var reloadTimeout;
        // function reload(){
        //     StatusSrv.reload().then(function(data){ 
        //         $scope.statusData = JSON.stringify(data, null, '  ');
        //     }).finally(function(){
        //         if (!$scope.$$destroyed) 
        //             reloadTimeout = $timeout(reload, 1000);
        //     })
        // }

        // $scope.$on("$destroy", function() {
        //     if (reloadTimeout) {
        //         $timeout.cancel(reloadTimeout);
        //     }
        // });
        
        
    }

}());