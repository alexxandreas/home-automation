(function () {
    "use strict";
    angular.module('GraphicsApp')
        .factory('ChartSrv', ChartSrv);

    // инициализируем сервис
    angular.module('GraphicsApp').run(['ChartSrv', function (ChartSrv) {
        //ChartSrv.init();
    }]);

    // angular.module('GraphicsApp').run(ChartSrv.init);

    ChartSrv.$inject = [
        '$rootScope',
        '$q'
    ];


    /**
     * events:
     * ChartSrv.highlightItem
     */
    function ChartSrv(
        $rootScope,
        $q
    ) {
        var waitChart = $q.defer();
        
        google.charts.load('current', {'packages':['corechart', 'timeline']});
        google.charts.setOnLoadCallback(function(){
            waitChart.resolve();
        });
        

        /*function init(){
                
            .run('$rootScope', function($rootScope){
                
            });
            defer.resolve(item);
        }*/

        function onChartsReady(){
            return waitChart.promise;
        }


        var me = {
            //init: init,
            onChartsReady: onChartsReady
        };


        return me;
    }
}());