(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ControlPanelCtrl', ControlPanelCtrl);

    ControlPanelCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        '$window',
        '$mdDialog',
        'ControlPanelSrv'
    ];

    function ControlPanelCtrl(
        $scope,
        $http,
        $timeout,
        $window,
        $mdDialog,
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
                    $scope.showAlert(data.updateResult[1]);
                }, function(response){
                    
                })
        };
        
        $scope.updateReload = function(){
            ControlPanelSrv
                .sysUpdateReload()
                .then(function(data){
                    console.log(data);
                    
                    $scope.showAlert(data.updateResult[1])
                        .then(function(){
                            $window.location.reload();
                        });
                }, function(response){
                    
                })
        };
        
        $scope.showAlert = function(title, message){
            // return $mdDialog.show(
            //     $mdDialog.alert()
            //         .parent(angular.element(document.querySelector('body')))
            //         .clickOutsideToClose(false)
            //         //.title(title)
            //         //.textContent(message)
            //         //.ok('OK')
                    
                    
            //         //controller: DialogController,
            //         .templateUrl: 'ControlPanelAlert.html'
            //         //parent: angular.element(document.body),
            //         //targetEvent: ev,
            //         //clickOutsideToClose:true,
            //         //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            // );
            return $mdDialog.show({
                //controller: DialogController,
                templateUrl: '/views/ControlPanel/htdocs/ControlPanelAlert.html',
                parent: angular.element(document.querySelector('body')),
                //targetEvent: ev,
                clickOutsideToClose:false,
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm b
            })
        }
        $scope.reload();
        
        
    }

}());