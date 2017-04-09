(function () {
    "use strict";
    angular.module('WebApp')
        .controller('LoggerCtrl', LoggerCtrl);

    LoggerCtrl.$inject = [
        '$scope',
        '$rootScope',
        '$http',
        '$timeout',
        '$window',
        '$sce',
        '$mdDialog',
        'LoggerSrv'
    ];

    function LoggerCtrl(
        $scope,
        $rootScope,
        $http,
        $timeout,
        $window,
        $sce,
        $mdDialog,
        LoggerSrv
    ) {
        
        $scope.logData = "";
        reload();

        var reloadTimeout;
        function reload(){
            LoggerSrv.reload().then(function(data){
                //data.forEach(function(dev){                });
                $scope.logData = data.join('\n');
            }).finally(function(){
                if (!$scope.$$destroyed) 
                    reloadTimeout = $timeout(reload, 2000);
            })
        }

        $scope.$on("$destroy", function() {
            if (reloadTimeout) {
                $timeout.cancel(reloadTimeout);
            }
        });
        
    }

}());