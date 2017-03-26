(function () {
    "use strict";
    angular.module('WebApp')
        .factory('ControlPanelSrv', ControlPanelSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['ControlPanelSrv', function(ApiSrv) {  }]);
    
    ControlPanelSrv.$inject = [
        '$http',
        'PanelsSrv'
    ];
    
    function ControlPanelSrv(
        $http,
        PanelsSrv
    ) {
        
        
        function reload(){
            return $http.get('/mha/modules/ControlPanel/api/modules').then(function(response){
                return response.data;
            });
        }
        
        function start(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/start').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function stop(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/stop').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function restart(name){
            return $http.get('/mha/modules/ControlPanel/api/modules/'+name+'/restart').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function sysUpdate(){
            return $http.get('/mha/modules/ControlPanel/update').then(function(response){
                return response.data;
            });
        }
        
        function sysUpdateReload(){
            return $http.get('/mha/modules/ControlPanel/updateReload').then(function(response){
                return response.data;
            });
        }
        
        var me = {
            reload: reload,
            start: start, 
            stop: stop,
            restart: restart,
            sysUpdate: sysUpdate,
            sysUpdateReload: sysUpdateReload
        };
        
        return me;
    }
}());