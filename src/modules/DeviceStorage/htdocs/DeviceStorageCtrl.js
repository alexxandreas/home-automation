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
        
        
        reload = function(){
            DeviceStorageSrv.reload().then(function(data){
                $scope.devices = data;
            }).finally(function(){
                $timeout(reload, 1000);
            })
        }
        
        
        loadDevices();
       
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        function loadPanels(){
            $http.get('/mha/modules/WebApp/api/panels').then(function(response){
                $scope.panels = response.data;
            }, function(response){
                //$q.reject(response);
            });
            
        }
    }

}());