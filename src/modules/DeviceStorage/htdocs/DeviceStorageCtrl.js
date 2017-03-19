(function () {
    "use strict";
    angular.module('WebApp')
        .controller('DeviceStorageCtrl', DeviceStorageCtrl);

    DeviceStorageCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        'DeviceStorageSrv'
    ];

    function DeviceStorageCtrl(
        $scope,
        $http,
        $timeout,
        DeviceStorageSrv
    ) {
        
        $scope.devices = {};
        //$interval(reload, 1000);
        reload();
        
        
        var reloadTimeout;
        function reload(){
            DeviceStorageSrv.reload().then(function(data){
                $scope.devices = data;
            }).finally(function(){
                reloadTimeout = $timeout(reload, 1000);
            })
        }
        
        $scope.getValueButtonClass = function(device){
            if (device.level === 0 || device.level.toLowerCase() === 'off')
                return 'redButon';
            else if (device.level === '99' || device.level.toLowerCase() === 'on')
                return 'greenButon';
            else return 'yellowButon';
        }
        
        $scope.$on("$destroy", function() {
            if (reloadTimeout) {
                $timeout.cancel(reloadTimeout);
            }
        });
        
    }

}());