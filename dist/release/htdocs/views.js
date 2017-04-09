angular.module("Views", []).run(["$templateCache", function($templateCache) {$templateCache.put("/views/ControlPanel/htdocs/ControlPanel.html","<div layout=\"column\" layout-align=\"start stretch\"\nng-controller=\"ControlPanelCtrl\"\nclass=\"ControlPanel\">\n\n  <div layout=\"row\" layout-align=\"start center\" flex=\"none\">\n    <md-button class=\"md-raised md-primary\" ng-click=\"update()\">Обновить без перезагрузки модулей</md-button>\n    <md-button class=\"md-raised md-primary\" ng-click=\"updateReload()\">Обновить с перезагрузкой всех модулей</md-button>\n  </div>\n  <md-list>\n    \n    <md-subheader class=\"md-no-sticky\">Приложения</md-subheader>\n    \n    <md-divider ng-repeat-start=\"(name, module) in modules\"></md-divider>\n    <md-list-item ng-repeat-end class=\"noright\">\n      <!--<img alt=\"{{ person.name }}\" ng-src=\"{{ person.img }}\" class=\"md-avatar\" />-->\n      <p>{{ name }}</p>\n      <!--<md-checkbox class=\"md-secondary\" ng-model=\"person.selected\"></md-checkbox>-->\n      <md-button class=\"md-icon-button md-accent\" ng-click=\"start(module);\" ng-disabled=\"!showStart(module)\">\n        <md-icon class=\"material-icons\">play_arrow</md-icon>\n      </md-button>\n      <md-button class=\"md-icon-button md-accent\" ng-click=\"stop(module)\" ng-disabled=\"!showStop(module)\">\n        <md-icon class=\"material-icons\">stop</md-icon>\n      </md-button>\n      <md-button class=\"md-icon-button md-accent\" ng-click=\"restart(module);\" ng-disabled=\"!showRestart(module)\">\n      <md-icon aria-label=\"replay\" class=\"material-icons\">replay</md-icon>\n      </md-button>\n    </md-list-item>\n    \n  </md-list>\n</div>");
$templateCache.put("/views/ControlPanel/htdocs/ControlPanelAlert.html","<md-dialog >\n  <form ng-cloak>\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>{{title}}</h2>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\" style=\"padding: 15px;\" ng-bind-html=\"message\">\n       \n      </div>\n    </md-dialog-content>\n\n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n      <md-button ng-click=\"ok()\">OK</md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>");
$templateCache.put("/views/DeviceStorage/htdocs/DeviceStorage.html","<div layout=\"column\" layout-align=\"start stretch\"\nng-controller=\"DeviceStorageCtrl\"\nclass=\"DeviceStorage\"\n\n    <!--<div layout=\"column\" layout-align=\"start stretch\"-->\n    \n    <md-table-container>\n      <table md-table >\n        <thead md-head >\n          <tr md-row>\n            <th md-column md-order-by=\"nameToLower\"><span>Key</span></th>\n            <th md-column md-numeric md-order-by=\"calories.value\"><span>Id</span></th>\n            <th md-column md-numeric>Title</th>\n            <th md-column md-numeric>Level</th>\n            <th md-column md-numeric>Last level change</th>\n\n          </tr>\n        </thead>\n        <tbody md-body>\n          <tr md-row md-select=\"device\" md-select-id=\"name\" md-auto-select ng-repeat=\"device in devices\">\n            <td md-cell>{{device.key}}</td>\n            <td md-cell>{{device.id}}</td>\n            <td md-cell>{{device.title}}</td>\n            <td md-cell><md-button ng-class=\"getValueButtonClass(device)\">{{device.level}}</md-button></td>\n            <td md-cell>{{formatTime(device.lastLevelChange)}}</td>\n          </tr>\n        </tbody>\n      </table>\n    </md-table-container>\n</div>");
$templateCache.put("/views/RemoteConsole/htdocs/RemoteConsole.html","<div layout=\"column\" layout-align=\"start stretch\" flex\nng-controller=\"RemoteConsoleCtrl\"\nclass=\"RemoteConsole\">\n\n  <div flex layout=\"column\" layout-align=\"start stretch\">\n    <textarea id=\"inputText\" class=\"inputText\" ng-model=\"input\" ng-keyup=\"keyUp($event)\" ></textarea>\n  </div>\n  \n  <div flex layout=\"column\" layout-align=\"start stretch\">\n    <textarea id=\"outputText\" class=\"outputText\" ng-model=\"output\"></textarea>\n  </div>\n  \n  <div layout=\"row\">\n    <md-button class=\"md-raised md-primary\" ng-click=\"run()\">Run</md-button>\n    <span layout=\"row\" layout-align=\"center center\">{{status}}</span>\n    <div flex></div>\n    <md-button class=\"md-raised md-primary\" ng-click=\"showHistory()\">История запросов</md-button>\n  </div>\n  \n</div>\n");
$templateCache.put("/views/RemoteConsole/htdocs/RemoteConsoleHistory.html","<md-dialog style=\"width: 100%; height: 100%\">\n  <form ng-cloak>\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>{{title}}</h2>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <!--<div class=\"md-dialog-content\" style=\"padding: 15px;\" ng-bind-html=\"message\">-->\n       \n      <!--</div>-->\n      <md-list>\n    \n        <!--<md-subheader class=\"md-no-sticky\">Приложения</md-subheader>-->\n        \n        <md-divider ng-repeat-start=\"item in history | orderBy:\'-\'\"></md-divider>\n        <md-list-item ng-repeat-end class=\"noright\" ng-click=\"openHistoryItem(item)\">\n            <div layout=\"row\" style=\"width: 100%;\">\n                <div  flex=\"50\" style=\"padding: 5px;\" ng-bind-html=\"makeHTML(item.src)\"></div>\n                <div  flex=\"50\" style=\"padding: 5px;\" ng-bind-html=\"makeHTML(item.result)\"></div>\n        </md-list-item>\n        \n      </md-list>\n    </md-dialog-content>\n\n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n      <md-button ng-click=\"cancel()\">Cancel</md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>");}]);