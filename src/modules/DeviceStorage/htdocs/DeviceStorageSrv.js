(function () {
    "use strict";
    angular.module('WebApp')
        .factory('DeviceStorageSrv', DeviceStorageSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['DeviceStorageSrv', function(ApiSrv) {  }]);
    
    DeviceStorageSrv.$inject = [
        '$http',
    ];
    
    function DeviceStorageSrv(
        $http
    ) {
        
        
        function reload(){
            return $http.get('modules/DeviceStorage/api/state').then(function(response){
                return response.data;
            });
        }
        
        var me = {
            reload: reload
        };
        
        return me;
    }
}());