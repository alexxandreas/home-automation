

(function () {
    "use strict";
    angular.module('GraphicsApp')
        .factory('ChartDataSrv', ChartDataSrv);

    // инициализируем сервис
    angular.module('GraphicsApp').run(['ChartDataSrv', function (ChartDataSrv) {
        //ChartDataSrv.init();
    }]);

    // angular.module('GraphicsApp').run(ChartDataSrv.init);

    ChartDataSrv.$inject = [
        '$rootScope',
        '$http',
        '$q'
    ];


    /**
     * events:
     * ChartDataSrv.highlightItem
     */
    function ChartDataSrv(
        $rootScope,
        $http,
        $q
    ) {

        var chartData; // google.visualization.DataTable  со всеми данными по графикам
        var chartOptions;

        function loadData(options){
            //options.devices;
            options = options || {};
            //var d = $q.defer();

            if (options.begin instanceof Date)
                options.begin = Math.round(options.begin.getTime()/1000);

            if (options.end instanceof Date)
                options.end = Math.round(options.end.getTime()/1000);

            var params = {
                devices: options.devices instanceof Array ? options.devices.join(',') : undefined,
                begin: options.begin,
                end: options.end
            };

            return $http.get('/static/myZWay.csv', {params:params}).then(function(response){
                //var data = response.data;
                prepareData(response.data);
                $rootScope.$broadcast('ChartDataSrv.dataLoaded');
                return true;
            },function(response){
                return $q.reject(response);
            });

            //return d.promise;


        }
        
        function prepareData(data){
            data = CSV2Object(data);
            var devices = {};
            var devicesA = []; // id -> index
            //var devCount = 0;
            angular.forEach(data, function(item){
                if(item.deviceId && !devices[item.deviceId]){
                    //devCount++; // 1 2 4
                    // 1, 5 - освещенность в туалете/ванной
                    // 2, 6 - влажность в ванной/туалете
                    // 4 - освещенность где-то
                    // 8 - освещенность на кухне
                    if (['8','2'].indexOf(item.deviceId) < 0) return;
                    devices[item.deviceId] = true; //devCount;
                    devicesA.push(item.deviceId);
                }
            });

            var res = [];


           /* var newData = [];
            var devicesLastValues = {};
            angular.forEach(data, function(item, itemIndex){
                value = Number.parseFloat(item.value);
                if (!Number.isNaN(value))
                    value = Math.round(value);
                else if (value == 'on')
                    value = 1;
                else
                    value = 0;
               if (value != devicesLastValues[item.deviceId]) {
                   devicesLastValues[item.deviceId] = value;
                   newData.push({deviceId:item.deviceId, value: value, time:item.time});
               }
            });
            var csv = newData.map(function(item){
                return item.time + ',' + item.deviceId + ',' + item.value;
            }).join('\n');
            csv = 'time,deviceId,value\n' + csv;
            //console.log(csv);
            saveToFile(csv);
            */

            // res.push([new Date(date.setMinutes(i)), last, last > 60 ? 40 : null]);
            var row, lastRow, value;
            var date = new Date();
            angular.forEach(data, function(item, itemIndex){
                if (!item.time) return;
                //row = [item.time];
                row = [new Date(date.setTime(item.time*1000))];
                angular.forEach(devicesA, function(device, rowIndex){
                    if (device == item.deviceId) {
                        //value = Math.round(Number.parseFloat(item.value));
                        value = Number.parseFloat(item.value);
                        if (!Number.isNaN(value))
                            row.push(value);
                        else if (value == 'on')
                            row.push(1);
                        else
                            row.push(0);
                    }

                    // else if (itemIndex != 0)
                    //     row.push(lastRow[rowIndex+1]);
                    // else row.push(0);

                    //else row.push(null)

                });
                lastRow = row;
                res.push(row);
            });

            prepareChartData(devicesA, res);
            //return res;

        }


        function prepareChartData(devices, rows){

            /*chartData = new google.visualization.DataTable();
             chartData.addColumn('date', 'Date');
             angular.forEach(devices, function(device){
             chartData.addColumn('number', 'device');
             });

             chartData.addRows(rows);*/
            var header = ['time'];
            angular.forEach(devices, function(device) {
                header.push(device)
            });

            rows.unshift(header);

            var csv = rows.map(function(row){
                return row.join(',');
            }).join('\n');

            chartOptions = {
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
                }/*,series: [
                    {
                        curveType: 'function'
                    },
                    {
                        lineWidth: 4,
                        color: 'green'
                    }
                ]*/
            };

            chartData = csv;
            
            //return dataTable;
        }

        function getData(){
            return dataTable;
        }

        function CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp((
                // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"), "\"");
                } else {
                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            // Return the parsed data.
            return (arrData);
        }

        function CSV2Object(csv){
            var array = CSVToArray(csv);
            var objArray = [];
            for (var i = 1; i < array.length; i++) {
                objArray[i - 1] = {};
                for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                    var key = array[0][k];
                    objArray[i - 1][key] = array[i][k]
                }
            }
            return objArray;
        }

        function saveToFile(data){
           // var json =  serialize();

            var blob = new Blob([data], {type:'text'});

            //var date = new Date();
            var fileName = 'file.txt';

            var link = document.createElement("a");
            link.download = fileName;
            link.innerHTML = "Download File";
            if (!!window.webkitURL)
            {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                link.href = window.webkitURL.createObjectURL(blob);
            }
            else
            {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                link.href = window.URL.createObjectURL(blob);
                link.onclick = function(){document.body.removeChild(event.target);};
                link.style.display = "none";
                document.body.appendChild(link);
            }

            link.click();
        }

        var me = {

            //init: init,
            loadData: loadData,
            getChartData: function(){return chartData;},
            getChartOptions: function(){return chartOptions;}
        };


        return me;
    }
}());