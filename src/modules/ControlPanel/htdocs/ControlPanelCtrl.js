(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ControlPanelCtrl', ControlPanelCtrl);

    ControlPanelCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        'ControlPanelSrv'
    ];

    function ControlPanelCtrl(
        $scope,
        $http,
        $timeout,
        ControlPanelSrv
    ) {
        $scope.modules = {};
        
        
        
        //var reloadTimeout;
        $scope.reload = function(){
            ControlPanelSrv.reload().then(function(data){
                Object.keys(data).forEach(function(name){
                    $scope.modules[name] = angular.extend($scope.modules[name] || {}, data[name]);
                });
            })
        }
        
        
        $scope.getValueButtonClass = function(device){
            if (device.level === 0 || device.level.toString().toLowerCase() === 'off')
                return 'redButon';
            else if (device.level === 99 || device.level.toString().toLowerCase() === 'on')
                return 'greenButon';
            return 'yellowButon';
        };
        
        $scope.start = function(module){
            ControlPanelSrv
                .start(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.stop = function(module){
            ControlPanelSrv
                .stop(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.restart = function(module){
            ControlPanelSrv
                .restart(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.showStart = function(module){
            return !module.loaded;
        };
        
        $scope.showStop = function(module){
            return !!module.created;
        };
        
        $scope.showRestart = function(module){
            return !!module.created;
        };
        
        $scope.update = function(){
            ControlPanelSrv
                .sysUpdate()
                .then(function(data){
                    console.log(data);
                }, function(response){
                    
                })
        };
        
        $scope.updateReload = function(){
            ControlPanelSrv
                .sysUpdateReload()
                .then(function(data){
                    console.log(data);
                }, function(response){
                    
                })
        };
        
        $scope.reload();
        
        
    }

}());