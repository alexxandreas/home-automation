(function () {
    "use strict";
    angular.module('WebApp')
        .controller('BodyCtrl', BodyCtrl);

    BodyCtrl.$inject = [
        '$scope',
        'PanelsSrv'
    ];

    function BodyCtrl(
        $scope,
        PanelsSrv
    ) {
        $scope.panels = [];
        
        $scope.$on('PanelsSrv.loaded', function(event, panels){
            $scope.panels = panels;
            if ($scope.activePanel && !$scope.panels.some(function(panel){ 
                return panel.key == $scope.activePanel.key;
            })) {
                $scope.activePanel = null;
            }
        });
        
        PanelsSrv.reload();
        
        //loadPanels();
       
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        // function loadPanels(){
        //     $http.get('modules/WebServer/api/panels').then(function(response){
        //         $scope.panels = response.data;
        //     }, function(response){
        //         //$q.reject(response);
        //     });
            
        // }
    }

}());