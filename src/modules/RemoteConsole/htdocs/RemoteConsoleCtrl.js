(function () {
    "use strict";
    angular.module('WebApp')
        .controller('RemoteConsoleCtrl', RemoteConsoleCtrl);

    RemoteConsoleCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        'RemoteConsoleSrv'
    ];

    function RemoteConsoleCtrl(
        $scope,
        $http,
        $timeout,
        RemoteConsoleSrv
    ) {
        
        $scope.input = "(function(){\n\n})()";
        $scope.output = "";
        $scope.status = "";
        
        RemoteConsoleSrv.getHistory().then(function(history){
            if (history.length > 0)
                $scope.input = history[history.length-1];
        });
        
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
            RemoteConsoleSrv.run($scope.input).then(function(response){
                $scope.output = JSON.stringify(response.data, null, '  ');
            }, function(response){
               $scope.output = JSON.stringify(response && response.data || response, null, '  ');
            }).finally(function(){
                $scope.status = ""+(new Date().getTime()-time)/1000 + ' sec';
            });
            
        	
        }
        
    }

}());

