angular.module("Views", []).run(["$templateCache", function($templateCache) {$templateCache.put("/views/ControlPanel/htdocs/ControlPanel.html","<div layout=\"column\" layout-align=\"start stretch\"\nng-controller=\"ControlPanelCtrl\"\nclass=\"ControlPanel\"\n\n    <!--<div layout=\"column\" layout-align=\"start stretch\"-->\n  <md-list>\n    <md-divider></md-divider>\n    \n    <md-subheader class=\"md-no-sticky\">Приложения<i class=\"material-icons md-dark\">face</i></md-subheader>\n    \n    <md-list-item ng-repeat=\"(name, module) in modules\" ng-click=\"goToPerson(person.name, $event)\" class=\"noright\">\n      <!--<img alt=\"{{ person.name }}\" ng-src=\"{{ person.img }}\" class=\"md-avatar\" />-->\n      <p>{{ name }}</p>\n      <!--<md-checkbox class=\"md-secondary\" ng-model=\"person.selected\"></md-checkbox>-->\n      <md-button ng-click=\"start(module);\" class=\"material-icons\">play arrow</md-button>\n      <md-button ng-click=\"stop(module)\"><i class=\"material-icons\">stop</i></md-button>\n      <md-button ng-click=\"restart(module);\"><i class=\"material-icons\">replay</i></md-button>\n    </md-list-item>\n    \n  </md-list>\n</div>");
$templateCache.put("/views/DeviceStorage/htdocs/DeviceStorage.html","<div layout=\"column\" layout-align=\"start stretch\"\nng-controller=\"DeviceStorageCtrl\"\nclass=\"DeviceStorage\"\n\n    <!--<div layout=\"column\" layout-align=\"start stretch\"-->\n    \n    <md-table-container>\n      <table md-table >\n        <thead md-head >\n          <tr md-row>\n            <th md-column md-order-by=\"nameToLower\"><span>Key</span></th>\n            <th md-column md-numeric md-order-by=\"calories.value\"><span>Id</span></th>\n            <th md-column md-numeric>Title</th>\n            <th md-column md-numeric>Level</th>\n            <th md-column md-numeric>Last level change</th>\n\n          </tr>\n        </thead>\n        <tbody md-body>\n          <tr md-row md-select=\"device\" md-select-id=\"name\" md-auto-select ng-repeat=\"device in devices\">\n            <td md-cell>{{device.key}}</td>\n            <td md-cell>{{device.id}}</td>\n            <td md-cell>{{device.title}}</td>\n            <td md-cell><md-button ng-class=\"getValueButtonClass(device)\">{{device.level}}</md-button></td>\n            <td md-cell>{{formatTime(device.lastLevelChange)}}</td>\n          </tr>\n        </tbody>\n      </table>\n    </md-table-container>\n</div>");}]);