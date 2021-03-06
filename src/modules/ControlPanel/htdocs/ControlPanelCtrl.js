(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ControlPanelCtrl', ControlPanelCtrl);

    ControlPanelCtrl.$inject = [
        '$scope',
        '$rootScope',
        '$http',
        '$timeout',
        '$window',
        '$sce',
        '$mdDialog',
        'ControlPanelSrv'
    ];

    function ControlPanelCtrl(
        $scope,
        $rootScope,
        $http,
        $timeout,
        $window,
        $sce,
        $mdDialog,
        ControlPanelSrv
    ) {
        $scope.modules = {};
        
        
        
        //var reloadTimeout;
        $scope.reload = function(){
            ControlPanelSrv.reload().then(function(data){
                Object.keys(data).forEach(function(name){
                    if (!data[name].visible) return;
                    $scope.modules[name] = angular.extend($scope.modules[name] || {}, data[name]);
                });
            }).finally(function(){
                $scope.hideWait();
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
            $scope.showWait();
            ControlPanelSrv
                .start(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.stop = function(module){
            $scope.showWait();
            ControlPanelSrv
                .stop(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.restart = function(module){
            $scope.showWait();
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
        
        
        $scope.sysUpdate = function(){
            $scope.showWait();
            ControlPanelSrv
                .sysUpdate()
                .then(function(data){
                    console.log(data);
                    $scope.hideWait();
                    $scope.showAlert('Обновление', data.updateResult[1]);
                }, function(response){
                    $scope.hideWait();
                })
        };
        
        $scope.sysReload = function(){
            $scope.showWait();
            ControlPanelSrv
                .sysReload()
                .then(function(data){
                    $scope.hideWait();
                    console.log(data);
                    
                    $scope.showAlert('Перезапуск', data)
                    .then(function(){
                        $scope.showWait();
                        $window.location.reload();
                    });
                    
                }, function(response){
                    $scope.hideWait();
                })
        };
        
        $scope.sysUpdateReload = function(){
            $scope.showWait();
            ControlPanelSrv
                .sysUpdateReload()
                .then(function(data){
                    $scope.hideWait();
                    console.log(data);
                    
                    $scope.showAlert('Обновление', 
                        'Обновление:\n' + 
                        data.updateResult[1] + 
                        '\n\nПерезапуск:\n' + 
                        data.reloadResult
                    )
                    .then(function(){
                        $scope.showWait();
                        $window.location.reload();
                    });
                }, function(response){
                    $scope.hideWait();
                })
                
        };
        
        $scope.showAlert = function(title, message){
        
            return $mdDialog.show({
                //controller: DialogController,
                templateUrl: '/views/ControlPanel/htdocs/ControlPanelAlert.html',
                parent: angular.element(document.querySelector('body')),
                //targetEvent: ev,
                clickOutsideToClose:false,
                locals: {
                    title: title,
                    message: $sce.trustAsHtml('<pre><code>'+message+'</code></pre>')
                },
                controller: DialogController
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm b
            })
            
            function DialogController($scope, $mdDialog, title, message) {
                $scope.title = title;
                $scope.message = message;
                $scope.ok = function() {
                  $mdDialog.hide();
                }
              }
        }
        
        $scope.showWait = function(){
            $mdDialog.show({
                // controller: 'waitCtrl',
                controller: waitCtrl,
                template: '<md-dialog style="background-color:transparent;box-shadow:none">' +
                            '<div layout="row" layout-sm="column" layout-align="center center" aria-label="wait" style="overflow: hidden">' +
                                '<md-progress-circular md-mode="indeterminate" ></md-progress-circular>' +
                            '</div>' +
                         '</md-dialog>',
                parent: angular.element(document.body),
                clickOutsideToClose:false,
                fullscreen: false
            })
            .then(function(answer) {
            
            });
            
            function waitCtrl($rootScope, $mdDialog) {
                $rootScope.$on("hide_wait", function (event, args) {
                    $mdDialog.cancel();
                });
            }
          
        }
   
        $scope.hideWait = function(){
            $rootScope.$emit("hide_wait"); 
        }
        
        $scope.reload();
        
        
    }

}());