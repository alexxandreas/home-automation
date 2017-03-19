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
            if (device.value === 0 || device.value === 'off')
                return 'redButon';
            else if (device.value === '99' || device.value === 'on')
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