(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ToolbarCtrl', ToolbarCtrl);

    ToolbarCtrl.$inject = [
        '$scope',
        '$rootScope'
    ];

    function ToolbarCtrl(
        $scope,
        $rootScope
    ) {
        $scope.panels = [{
            title: '1dfasdf'
        }, {
            title: '2vth`sga'
        }, {
            title: '3aljfa;siof'
        }]
        
        $scope.activePanel = $scope.panels[0];
        
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        
        
        /*$scope.deviceTypes = [
            {
                type: 'button',
                title: 'Кнопка',
                devices: [{
                    id: 'id-1',
                    title: 'Кнопка-1',
                    selected: false
                },{
                    id: 'id-2',
                    title: 'Кнопка-2',
                    selected: false
                },{
                    id: 'id-3',
                    title: 'Кнопка-3',
                    selected: false
                }]
            },{
                type: 'sensorMultilevel',
                title: 'Датчик',
                devices: [{
                    id: 'id-1',
                    title: 'Датчик-1',
                    selected: false
                },{
                    id: 'id-2',
                    title: 'Датчик-2',
                    selected: false
                },{
                    id: 'id-3',
                    title: 'Датчик-3',
                    selected: false
                }]
            },{
                type: 'sensorBynary',
                title: 'Бинарный датчик',
                devices: [{
                    id: 'id-1',
                    title: 'Бинарный датчик-1',
                    selected: false
                },{
                    id: 'id-2',
                    title: 'Бинарный датчик-2',
                    selected: false
                },{
                    id: 'id-3',
                    title: 'Бинарный датчик-3',
                    selected: false
                }]
            }
        ];

        $scope.onDeviceClicked = function(){
            var a = $scope.deviceTypes;
            a = 10;
        };

        $scope.reloadData = function(){
            ChartDataSrv.loadData();
        }*/
    }

}());