(function () {
    "use strict";
    angular.module('WebApp')
        .controller('RemoteConsoleCtrl', RemoteConsoleCtrl);

    RemoteConsoleCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        '$mdDialog',
        'RemoteConsoleSrv'
    ];

    function RemoteConsoleCtrl(
        $scope,
        $http,
        $timeout,
        $mdDialog,
        RemoteConsoleSrv
    ) {
        
        $scope.input = "(function(){\n\n})()";
        $scope.output = "";
        $scope.status = "";
        
        RemoteConsoleSrv.getHistory().then(function(history){
            if (history.length > 0){
                $scope.loadFromHistory([history.length-1]);
            }
        });
        
        $scope.loadFromHistory = function(item){
            $scope.input = item.src;
            $scope.output = item.result;
        };
        
        $scope.showHistory = function(){
            RemoteConsoleSrv.getHistory().then(function(history){
                $mdDialog.show({
                  controller: DialogController,
                  //templateUrl: 'dialog1.tmpl.html',
                  templateUrl: '/views/RemoteConsole/htdocs/RemoteConsoleHistory.html',
                  parent: angular.element(document.body),
                  //targetEvent: ev,
                  locals: {
                        title: "История запросов",
                        history: history
                        //message: $sce.trustAsHtml('<pre><code>'+message+'</code></pre>')
                  },
                  clickOutsideToClose:true,
                  fullscreen: true // Only for -xs, -sm breakpoints.
                })
                .then(function(answer) {
                  //$scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                  //$scope.status = 'You cancelled the dialog.';
                });
                var parentScope = $scope;
                function DialogController($scope, $mdDialog, title, history) {
                    
                    $scope.title = title;
                    $scope.history = history;
                    
                    // $scope.hide = function() {
                    //   $mdDialog.hide();
                    // };
                
                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                
                    $scope.openHistoryItem = function(item) {
                      parentScope.loadFromHistory(item);
                      $mdDialog.cancel();
                    };
                }
            });
        };
        
        var time;
        
        $scope.keyUp = function(event){
            if (event.which==13 && event.ctrlKey) $scope.run();
        }
        
        $scope.run = function(){
            
            time = new Date().getTime();
            $scope.status = 'running...';
        	//var tnode = document.getElementById("JStiming");
            //tnode.innerHTML = "running...";
        	
            //var code = document.getElementById("JSprogram").value;
            RemoteConsoleSrv.run($scope.input).then(function(data){
                $scope.output = data;
            }, function(response){ })
            .finally(function(){
                $scope.status = ""+(new Date().getTime()-time)/1000 + ' sec';
            });
            
        	
        }
        
    }

}());

