(function () {
    "use strict";

    angular.module('GraphicsApp')
        .directive('chartDir', ChartDir);

    ChartDir.$inject = [
        //'$scope',
        'ChartSrv'
    ];

    function ChartDir(
        //$scope,
        ChartSrv
    ) {

        
        return {
            restrict: 'E',
            replace: true,
            controller: "ChartCtrl",
            //templateUrl: '/views/controls/contextMenu/contextMenu.html',

            link: function ($scope, $el, attrs) {
                $scope.el = $el;
                // ChartSrv.onChartsReady().then(function(){
                //     $scope.initChart($el);
                // });
            }


        };
    }


}());