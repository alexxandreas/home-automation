(function () {
    "use strict";
    angular.module('GraphicsApp')
        .controller('ChartCtrl', ChartCtrl);

    ChartCtrl.$inject = [
        '$scope',
        '$window',
        '$timeout',
        'ChartDataSrv'
    ];

    function ChartCtrl(
        $scope,
        $window,
        $timeout,
        ChartDataSrv
    ) {
        
        
        $scope.drawChart2 = function() {
            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Date');
            data.addColumn('number', 'Order amount');
            data.addColumn('number', 'sensor binary');

            // var data2 = new google.visualization.DataTable();
            // data2.addColumn('date', 'Date');
            //data2.addColumn('number', 'Order amount');
            // data2.addColumn('number', 'sensor binary');

            var end = new Date(2014,1,24);
            var date = new Date(2008,1,13);
            var rows = [];
            var rows2 = [];
            var last = 50;
            //var sensorBegin = false;
            var lastSensorVal = null;
            var clearSensorVal = false;
            //var sensorRows = [];
            for (var i = 1; i < 1000; i++){
                var delta = Math.random()*3-1.5;
                last = last + delta > 0 && last+delta < 100 ? last+delta : last - delta;

                //var newSensorVal = last > 60 ? 40 : null;

                rows.push([new Date(date.setMinutes(i)), last, last > 60 ? 40 : null]);
                //rows.push([new Date(date.setMinutes(i)), last]);


                /*
                 if (clearSensorVal){
                 rows2.push([new Date(date.setMinutes(i)), 0]);
                 clearSensorVal = false;
                 }
                 if (newSensorVal != lastSensorVal){
                 if (!lastSensorVal){ // 0 -> 1
                 rows2.push([new Date(date.setMinutes(i)), 40]);
                 } else { // 1 -> 0
                 rows2.push([new Date(date.setMinutes(i)), 40]);
                 clearSensorVal = true;
                 }
                 lastSensorVal = newSensorVal;
                 }*/



                /*if (last > 60 && !sensorBegin){
                 sensorBegin = new Date(date.setDate(i));
                 } else if (last <= 60 && sensorBegin) {
                 //sensorRows.push(['sensor', 'sensor1', sensorBegin, new Date(date.setDate(i))]);
                 sensorRows.push(['sensor', sensorBegin, new Date(date.setDate(i))]);
                 sensorBegin = null;
                 }*/
            }
            /*if (sensorBegin){
             //sensorRows.push(['sensor', 'sensor1', sensorBegin, new Date(date.setDate(i))]);
             sensorRows.push(['sensor', sensorBegin, new Date(date.setDate(i))]);
             sensorBegin = null;
             }*/


            /*var dataTable = new google.visualization.DataTable();
             dataTable.addColumn({ type: 'string', id: 'Position' });
             //dataTable.addColumn({ type: 'string', id: 'Name' });
             dataTable.addColumn({ type: 'date', id: 'Start' });
             dataTable.addColumn({ type: 'date', id: 'End' });
             dataTable.addRows(sensorRows);
             */

            data.addRows(rows);
            // data2.addRows(rows2);

            // var data3 = google.visualization.data.join(data, data2, 'full', [[0, 0]], [1], [1]);


            // https://developers.google.com/chart/interactive/docs/gallery/linechart#configuration-options
            var options = {
                chartArea: {
                    width:'90%',
                    height:'90%'
                },
                legend: {
                    position:'none'
                },
                explorer: {
                    maxZoomOut: 4,
                    maxZoomIn: 0.25,
                    zoomDelta: 1.5,
//			maxZoomOut: 0.25,
//			maxZoomIn: 4,
//			zoomDelta: 0.75,


                    axis: 'horizontal',

                    keepInBounds: true
                },
                //pointsVisible: false
                tooltip: {
                    trigger: 'none'
                },
                hAxis: {

                },

                enableInteractivity: false,
                pointsVisible: false,
                vAxis: {
                    //maxValue: 70,
                    //minValue: 30,
                    //viewWindowMode: 'pretty',
                    viewWindow: {
                        max: 100,
                        min: 0
                    },
                    ticks: [{
                        v:40, f:'sensor'
                    }, {
                        v:60, f:'sixty'
                    }]
                },series: [
                    {
                        curveType: 'function'
                    },
                    {
                        lineWidth: 4,
                        color: 'green'
                    }
                ]
            };

            // var chart = new google.visualization.LineChart(document.getElementById('chartDiv'));
            // chart.draw(data, options);


            //var chart2 = new google.visualization.LineChart(document.getElementById('chartDiv2'));
            //chart2.draw(data2);
            return [data, options];
        };

        $scope.drawChart0 = function(){

            //var data2 = $scope.drawChart2();
            var data = ChartDataSrv.getChartData();
            var options = ChartDataSrv.getChartOptions();
            if (data)
                $scope.chart.draw.call($scope.chart, data, options);
        };

        var refreshTO;
        $scope.refreshCart = function(){
            refreshTO && $timeout.cancel(refreshTO);
            refreshTO = $timeout(function(){
                console.log('refresh');
                $scope.drawChart();
            }, 500);
        };


        $scope.drawChart = function(){

            //var data2 = $scope.drawChart2();
            var data = ChartDataSrv.getChartData();
            //var options = ChartDataSrv.getChartOptions();
            if (!data) return;
            //$scope.chart.draw.call($scope.chart, data, options);
            Dygraph.addEvent(document, "mousewheel", function() { lastClickedGraph = null; });
            Dygraph.addEvent(document, "click", function() { lastClickedGraph = null; });

            $scope.dygraph = new Dygraph($scope.el[0],
                //"temperatures.csv", // path to CSV file
                function(){return data;},
                {
                    highlightCircleSize: 0,
                    showLabelsOnHighlight: false,
                    connectSeparatedPoints: true,
                    //rollPeriod: 14,
                    //showRoller: true,
                    interactionModel : {
                        'mousedown' : downV3,
                         'mousemove' : moveV3,
                         'mouseup' : upV3,
                         'click' : clickV3,
                         'dblclick' : dblClickV3,
                        'mousewheel' : scrollV3
                    }
                }

            );
        };



        $scope.initChart = function(el){
           /* //$scope.el = $el;
            $scope.chart = new google.visualization.LineChart(el[0]);

            $scope.drawChart();
            //var data = $scope.drawChart();
            //$scope.chart.draw.apply($scope.chart, data);

            angular.element($window).bind('resize', function() {
                $scope.refreshCart();
                $scope.$apply();
            });
*/


            /*$scope.$watch(
                function () {
                    return [el[0].offsetWidth, el[0].offsetHeight].join('x');
                },
                function (value) {
                    $scope.refreshCart();
                }
            )*/
        };

        $scope.$on('ChartDataSrv.dataLoaded', $scope.drawChart);
        

    }

}());