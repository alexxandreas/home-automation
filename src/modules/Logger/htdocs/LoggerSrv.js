(function () {
    "use strict";
    angular.module('WebApp')
        .factory('LoggerSrv', LoggerSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['LoggerSrv', function(ApiSrv) {  }]);
    
    LoggerSrv.$inject = [
        '$http',
        'PanelsSrv'
    ];
    
    function LoggerSrv(
        $http,
        PanelsSrv
    ) {
        
        var lastTime = 0;
        var logArray = [];
        
        function reload(){
            return $http.get('modules/Logger/api/getLog/' + lastTime).then(function(response){
                var arr = response.data;
                logArray = logArray.concat(arr).slice(-1000);
                lastTime = logArray[logArray.length-1].time;
                return logArray;
            });
        }
        
        
        
        var me = {
            reload: reload
        };
        
        return me;
    }
}());