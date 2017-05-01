(function() {
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

        var history = [];
        var historyLoaded = false;

        function run(str) {
            var encoded = encodeURIComponent(str);
            //return $http.get('modules/RemoteConsole/api/eval/' + encoded)
            return $http({
                url: 'modules/RemoteConsole/api/eval/' + encoded,
                method: 'GET',
                transformResponse: function(value) {
                    return value;
                }
            }).then(function(response) {
                var data = JSON.stringify(response.data, null, '  ');
                history.push({
                    src: str,
                    result: data
                });
                return data;
            }, function(response) {
                var data = JSON.stringify(response && response.data || response, null, '  ');
                history.push({
                    src: str,
                    result: data
                });
                return data;
            });
        }


        function getHistory() {
            return $q(function(resolve, reject) {
                if (historyLoaded) {
                    resolve(history);
                }
                else {
                    $http.get('modules/RemoteConsole/api/history').then(function(response) {
                        history = response.data;
                        historyLoaded = true;
                        resolve(history);
                    }, function(response) {
                        historyLoaded = true;
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
