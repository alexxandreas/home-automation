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
        
        $scope.input = "";
        $scope.output = "";
        $scope.status = "";
        
        var time;
        
        $scope.keyUp = function(event){
            if (event.which==77 && event.ctrlKey) $scope.run();
        }
        
        $scope.run = function(){
            
            time = new Date().getTime();
        	//var tnode = document.getElementById("JStiming");
            //tnode.innerHTML = "running...";
        	
            //var code = document.getElementById("JSprogram").value;
            
            $http.get('/mha/modules/RemoteConsole/api/eval/' + input).then(function(response){
                output = JSON.stringify(response, null, '  ');
            }, function(){
               output = JSON.stringify(response, null, '  ');
            }).finally(function(){
                $scope.status = ""+(new Date().getTime()-time)/1000;
            });
            
        	
        }
        
    }

}());

