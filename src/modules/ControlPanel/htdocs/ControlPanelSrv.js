(function () {
    "use strict";
    angular.module('WebApp')
        .factory('ControlPanelSrv', ControlPanelSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['ControlPanelSrv', function(ApiSrv) {  }]);
    
    ControlPanelSrv.$inject = [
        '$http',
    ];
    
    function ControlPanelSrv(
        $http
    ) {
        
        
        function reload(){
            return $http.get('/mha/modules/ControlPanel/api/modules').then(function(response){
                return response.data;
            });
        }
        
        function start(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/start').then(function(response){
                return response.data;
            });
        }
        
        function stop(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/stop').then(function(response){
                return response.data;
            });
        }
        
        function restart(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/restart').then(function(response){
                return response.data;
            });
        }
        
        
        var me = {
            reload: reload,
            start: start, 
            stop: stop,
            restart: restart
        };
        
        return me;
    }
}());