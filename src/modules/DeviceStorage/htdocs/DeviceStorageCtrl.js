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
        
        
        function reload(){
            DeviceStorageSrv.reload().then(function(data){
                $scope.devices = data;
            }).finally(function(){
                $timeout(reload, 1000);
            })
        }
        
    }

}());