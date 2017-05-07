(function () {
    "use strict";
    angular.module('WebApp')
        .factory('StatusSrv', StatusSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['StatusSrv', function(ApiSrv) {  }]);
    
    StatusSrv.$inject = [
        '$http',
        'PanelsSrv'
    ];
    
    function StatusSrv(
        $http,
        PanelsSrv
    ) {
        
        
        function reload(){
            return $http.get('modules/Status/api/status').then(function(response){
                return response.data;
            });
        }
        
        
        var me = {
            reload: reload
        }
        
        return me;
    }
}());