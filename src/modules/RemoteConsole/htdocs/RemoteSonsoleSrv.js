(function () {
    "use strict";
    angular.module('WebApp')
        .factory('RemoteConsoleSrv', RemoteConsoleSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['RemoteConsoleSrv', function(ApiSrv) {  }]);
    
    RemoteConsoleSrv.$inject = [
        '$http',
        '$q'
    ];
    
    function RemoteConsoleSrv(
        $http,
        $q
    ) {
        
        
        function run(str){
            return $http.get('modules/RemoteConsole/api/eval/' + str);
            history.push(str);
        }
        
        
        var history = [];
        function getHistory(){
            return $q(function(resolve, reject){
                if (history){
                    resolve(history);
                } else {
                    $http.get('modules/RemoteConsole/api/history').then(function(response){
                        history = response.data;
                        resolve(history);
                    }, function(response){
                       //history = [];
                       resolve(history);
                    })
                }
            })
        }
        
        var me = {
            run: run,
            getHistory: getHistory
        };
        
        return me;
    }
}());