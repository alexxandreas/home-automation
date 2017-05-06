/*
global config, inherits, controller, MHA
*/
define('DeviceStorage', ['AbstractModule', 'WebServer', 'UtilsVDev'],
    function(AbstractModule, WebServer, UtilsVDev) {

        function DeviceStorage(config) {
            DeviceStorage.super_.call(this, config);
            this.name = 'DeviceStorage';
            this.log('construcror');

            this._initDevices();
            this._initFrontend();

        }

        inherits(DeviceStorage, AbstractModule);


        DeviceStorage.prototype._FGD211Scenes = {
            10: "Switch from off to on",
            11: "Switch from on to off",
            //12: "S1 holding down",
            13: "S1/S2 releasing",
            14: "S1 double click",
            //15: "S1 triple click",
            //16: "S1 single click",
            17: "S1 Brighten",
            18: "S2 Dim"
            //22: "S2 holding down",
            //23: "S2 releasing",
            //24: "S2 double click",
            //25: "S2 triple click",
            //26: "S2 single click"
        };


        DeviceStorage.prototype._deviceTypes = {
            'default': {},
            'FGD211': {},
            scene: {}
        };

        DeviceStorage.prototype._initDevices = function() {
            var dict = {
                'hallway': 'прихожая',
                'corridor': 'коридор',
                'bathroom': 'ванная',
                'toilet': 'туалет',
                'kitchen': 'кухня',
                'wardrobe': 'гардеробная',
                'bedroom': 'спальня',
                'hall': 'холл',

                'light': 'свет',
                'L220': ['220', 'основно'],
                'L12': ['12', 'подсветка'],
                'sensor': 'датчик',
                'motion': 'движен',
                'temp': 'темпер',
                'hum': 'влажн',
                'fan': ['вытяжка', 'вентилятор'],
                'door': 'двер',
                'tabletop': 'столешниц',
                'switch_': 'выключател',
                'center': 'центр',
                'edge': 'угл',
                'rgb': 'rgb'
            };
            
            var types = {
                'default': {},
                'FGD211': {},
                scene: {}
            };

            this.devs = {
                'hallway.switch220': { name:   [dict.hallway, dict.light, dict.L220], type: this._deviceTypes.FGD211}, //  FGD-211
                'hallway.light12': { name:  [dict.hallway, dict.light, dict.L12], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.2) (1110)
                'hallway.motionSensor': { name:  [dict.hallway, dict.sensor, dict.motion], type: this._deviceTypes.default}, //  FGMS-001
                'hallway.lightSensor': { name:  [dict.hallway, dict.sensor, dict.light], type: this._deviceTypes.default}, //  FGMS-001
                'hallway.tempSensor': { name:  [dict.hallway, dict.sensor, dict.temp], type: this._deviceTypes.default}, //  FGMS-001
                'hallway.door': { name:  [dict.hallway, dict.door], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.3 или x.5)
                
                'corridor.switch220': { name:  [dict.corridor, dict.light, dict.L220], type: this._deviceTypes.FGD211}, //  FGD-211
                'corridor.motionSensor': { name:  [dict.corridor, dict.sensor, dict.motion], type: this._deviceTypes.default}, //  FGMS-001
                'corridor.lightSensor': { name:  [dict.corridor, dict.sensor, dict.light], type: this._deviceTypes.default}, //  FGMS-001
                'corridor.tempSensor': { name:  [dict.corridor, dict.sensor, dict.temp], type: this._deviceTypes.default}, //  FGMS-001
                
                'bathroom.switch220': { name:  [dict.bathroom, dict.light, dict.L220], type: this._deviceTypes.FGD211}, //  FGD-211
                'bathroom.motionSensor': { name:  [dict.bathroom, dict.sensor, dict.motion], type: this._deviceTypes.default}, //  Aeon
                'bathroom.lightSensor': { name:  [dict.bathroom, dict.sensor, dict.light], type: this._deviceTypes.default}, //  Aeon
                'bathroom.tempSensor': { name:  [dict.bathroom, dict.sensor, dict.temp], type: this._deviceTypes.default}, //  Aeon
                'bathroom.humSensor': { name:  [dict.bathroom, dict.sensor, dict.hum], type: this._deviceTypes.default}, //  Aeon
                'bathroom.door': { name:  [dict.bathroom, dict.door], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.2) (1110)
                
                'toilet.switch220': { name:  [dict.toilet, dict.light, dict.L220], type: this._deviceTypes.FGD211}, //  FGD-211
                'toilet.light12': { name:  [dict.toilet, dict.light, dict.L12], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.5) (1110)
                'toilet.motionSensor': { name:  [dict.toilet, dict.sensor, dict.motion], type: this._deviceTypes.default}, //  Aeon
                'toilet.lightSensor': { name:  [dict.toilet, dict.sensor, dict.light], type: this._deviceTypes.default}, //  Aeon
                'toilet.tempSensor': { name:  [dict.toilet, dict.sensor, dict.temp], type: this._deviceTypes.default}, //  Aeon
                'toilet.humSensor': { name:  [dict.toilet, dict.sensor, dict.hum], type: this._deviceTypes.default}, //  Aeon
                'toilet.fan': { name:  [dict.toilet, dict.fan], type: this._deviceTypes.default}, // 
                'toilet.door': { name:  [dict.toilet, dict.door], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.3) (1110)
                
                'kitchen.switch220': { name:  [dict.kitchen, dict.light, dict.L220], type: this._deviceTypes.FGD211}, //  FGD-211
                'kitchen.light12': { name:  [dict.kitchen, dict.light, dict.L12], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.2) (1110)
                'kitchen.motionSensor': { name:  [dict.kitchen, dict.sensor, dict.motion], type: this._deviceTypes.default}, //  FGMS-001
                'kitchen.lightSensor': { name:  [dict.kitchen, dict.sensor, dict.light], type: this._deviceTypes.default}, //  FGMS-001
                'kitchen.tempSensor': { name:  [dict.kitchen, dict.sensor, dict.temp], type: this._deviceTypes.default}, //  FGMS-001
                'kitchen.tabletopLight': { name:  [dict.kitchen, dict.light, dict.tabletop], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.5)
                'kitchen.tabletopSwitch': { name:  [dict.kitchen, dict.switch_, dict.tabletop], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.3) (0001)
                
                'wardrobe.switch220': { name:  [dict.wardrobe, dict.light], type: this._deviceTypes.default}, // 
                'wardrobe.door': { name:  [dict.wardrobe, dict.door], type: this._deviceTypes.default}, //  FGRGBWM-441  (x.4)
                
                'bedroom.switch220center': { name:  [dict.bedroom, dict.light, dict.center], type: this._deviceTypes.FGD211}, //  FGD-211
                'bedroom.switch220edge': { name:  [dict.bedroom, dict.light, dict.edge], type: this._deviceTypes.FGD211}, //  FGD-211
                'bedroom.rgb': { name:  [dict.bedroom, dict.light, dict.rgb], type: this._deviceTypes.default}, //  FGRGBWM-441 (switchRGBW) (1110 1110 1110)
                'bedroom.w': { name:  [dict.bedroom, dict.light, dict.L12], type: this._deviceTypes.default}, //  FGRGBWM-441 (x.5) (1110)
                
                'hall.switch220center': { name:  [dict.hall, dict.light, dict.center], type: this._deviceTypes.FGD211}, //  FGD-211
                'hall.switch220edge': { name:  [dict.hall, dict.light, dict.edge], type: this._deviceTypes.FGD211}, //  FGD-211
                'hall.rgb': { name:  [dict.hall, dict.light, dict.rgb], type: this._deviceTypes.default}, //  FGRGBWM-441 (switchRGBW) (1110 1110 1110)
                'hall.w': { name: [dict.hall, dict.light, dict.L12], type: this._deviceTypes.default}, // FGRGBWM-441 (x.5) (1110)
            };

            
            // массив названий комнат
            // var namesArray = Object.keys(this.devs).map(function(name) {
            //     return name.split('.').shift();
            // });
            // this.rooms = namesArray.filter(function(item, pos) {
            //     return namesArray.indexOf(item) == pos;
            // });


            this.devices = {};

            // получаем все перечисленные устройства
            this.log('initDevices');
            Object.keys(this.devs).forEach(function(key) {
                this._initDevice(key);
                var type = this.devs[key].type;
                if (type == this._deviceTypes.FGD211) { 
                    Object.keys(this._FGD211Scenes).forEach(function(sceneId) {
                        this._initScene(key, sceneId);
                    }, this);
                }
            }, this);
            
        };


        /** 
         * Производит поиск и инициализацию сцены по ключу устройства и номеру сцены
         * ! Возможно, текущий подход к именованию сцен будет работать 
         * ! только для FGD211
         */
        DeviceStorage.prototype._initScene = function(key, sceneId) {
            var vDev = this.getDevice(key);
            if (!vDev) return;

            var realId = this._getRealId(vDev.id);
            if (realId == null) return;


            var sceneName = "ZWayVDev_zway_Remote_" + realId + "-0-0-" + sceneId + "-S";
            var vDev = this.getVDev(sceneName);
            if (!vDev) {
                this.log('Error: сцена ' + sceneId + ' для ' + key + ' не найдена');
            }
            else {
                this._pushDevice(key + '_' + sceneId, this._deviceTypes.scene, vDev);
                //   this.devices[key + '_' + sceneId] = vDev;
            }
        };


        /** 
         * Производит поиск и инициализацию устройства по ключу
         */
        DeviceStorage.prototype._initDevice = function(key) {
            var vDevs = this._getDevicesByName(this.devs[key].name);
            if (vDevs.length == 0) {
                this.log('Error: initDevice(' + key + '): not found: ' + JSON.stringify(this.devs[key].name));
                //return null;
            }
            else if (vDevs.length > 1) {
                var text = vDevs.map(function(vDev) {
                    return vDev.id + '(' + vDev.get('metrics:title') + ')';
                }).join(', ');
                this.log('Error: initDevice(' + key + '): found ' + vDevs.length + 'devices: ' + text);
                //return null;
            }
            else {
                this._pushDevice(key, this.devs[key].type, vDevs[0]);
            }
            //   this.devices[key] = vDevs[0];
            //return vDevs[0];
        }


        /** Поиск vDev по заданному названию
            parts = [part, part, ...]
            parts = [part, [subPart, subPart, ...], ...]
            part - строки, объединяются условием И
            subPart - строки, объединяются условием ИЛИ
            поиск регистронезависимый
            ex: (['Кухня', 'свет'])
            ex: ([
                ['Кухня', 'Kitchen'],
                ['свет', 'light']
            ])
            возвращает массив подходящих vDev        
        */
        DeviceStorage.prototype._getDevicesByName = function(parts) {
            //this.log('getDevicesByName ' + JSON.stringify(parts));
            //var self = this;

            var devices = [];
            controller.devices.forEach(function(vDev) {
                var devName = vDev.get('metrics:title') || '';
                devName = devName.toLowerCase();
                //self.log(devName);
                if (parts.every(function(part) {
                        if (part instanceof Array) {
                            return part.some(function(subPart) {
                                return devName.indexOf(subPart.toLowerCase()) >= 0;
                            });
                        }
                        else {
                            return devName.indexOf(part.toLowerCase()) >= 0;
                        }
                    })) {
                    devices.push(vDev);
                }
            }, this);
            return devices;
        };



        // Добавляет vDev в список устройств и инициализирует у него свойство MHA
        // key - ключ из this.devs
        DeviceStorage.prototype._pushDevice = function(key, type, vDev) {
            this.devices[key] = vDev;
            UtilsVDev.createMHA(key, type, vDev);
            //this.log('device ' + key + ' added');
        };


        DeviceStorage.prototype.getDevice = function(key) {
            if (!key)
                return null;
            if (!this.devices[key]) {
                var parts = key.split('_');
                var devKey = parts[0];
                var sceneId = parts[1];
                if (sceneId === undefined)
                    this._initDevice(key);
                else
                    this._initScene(devKey, sceneId);
            }
            
            if (!this.devices[key])
                return null;
                
            return this.devices[key];
        };


        // возвращает vDev по его id
        DeviceStorage.prototype.getVDev = function(id) {
            var vDev = controller.devices.get(id);
            return vDev;
        };


        /** Получение id физического устройства */
        DeviceStorage.prototype._getRealId = function(vDevId) {
            //var id = vDev.id;
            var id = vDevId;
            var res = id.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
            if (res.length >= 2) return res[1];
            return null;
        };


        DeviceStorage.prototype._initFrontend = function() {
            var ws = WebServer;

            ws.addRoute('/modules/' + this.name + '/api/:method', function(args) {
                var method = args[0];
                if (method == 'state') {

                    var data = Object.keys(this.devices).map(function(key) {
                        var vDev = this.devices[key];
                        return {
                            key: key,
                            id: vDev.id,
                            title: vDev.get('metrics:title'),
                            level: vDev.MHA.getLevel(),
                            lastLevelChange: vDev.MHA.lastLevelChange(true)
                        };
                    }, this);

                    return ws.sendJSON(data);
                }

                return ws.sendError(404, method + ' not found');
            }, this);

            WebServer.addPanel({
                key: this.name,
                title: 'Device Storage',
                template: '/views/DeviceStorage/htdocs/DeviceStorage.html'
            });
        };


        DeviceStorage.prototype.stop = function() {
            Object.keys(this.devices).forEach(function(key) {
                var vDev = this.devices[key];
                UtilsVDev.destroyMHA(vDev);

                // controller.devices.off(vDev.id, 'change:metrics:level', vDev.MHA._baseLevelChangeHandler);
                // vDev.MHA._action(); // останавливаем action
                // Object.keys(vDev.MHA).forEach(function(key) {
                //     delete vDev.MHA[key];
                // });
                // delete vDev.MHA;
            }, this);

            WebServer.removePanel(this.name);
            DeviceStorage.super_.prototype.stop.apply(this, arguments);
        };

        return new DeviceStorage(config);
    });
