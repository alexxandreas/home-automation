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
        
        $scope.updateReload = function(){
            $scope.showWait();
            ControlPanelSrv
                .sysUpdateReload()
                .then(function(data){
                    $scope.hideWait();
                    console.log(data);
                    
                    $scope.showAlert('Обновление', 
                        'Обновление:\n' + 
                        data.updateResult[1] + 
                        '\n\nПерезагруженные модули:\n' + 
                        data.reloadResult.join(', ')
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
            //message = message.replace('\n', '<br>');
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
                            '<div layout="row" layout-sm="column" layout-align="center center" aria-label="wait">' +
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