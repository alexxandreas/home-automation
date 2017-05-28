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

        DeviceStorage.prototype._deviceTypes = {
            'default':      { mha: 'default' },
            'door':         { mha: 'door' },
            'virtualDoor':  { mha: 'virtualDoor' },
            'tabletopSwitch': {mha: 'tabletopSwitch' },
            'FGD211':       { mha: 'FGD211' },
            'rgb':          { mha: 'rgb' },
            'scene':        { mha: 'default' }
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
            
            this.hwDevs = {
                'hallway.FGD-211': {},
                'hallway.FGRGBWM-441': {},
                'hallway.FGMS-001': {},
                
                'corridor.FGD-211': {},
                'corridor.FGMS-001': {},
                
                'bathroom.FGD-211': {},
                'bathroom.AEON-MS': {},
                'bathroom.TZ66D': {},
                
                
                'toilet.FGD-211': {},
                'toilet.AEON-MS': {},
                'toilet.FGRGBWM-441': {},
                
                'kitchen.FGD-211': {},
                'kitchen.FGRGBWM-441': {},
                'kitchen.FGMS-001': {},
                
                'wardrobe.TZ66D': {},
                
                'bedroom.FGD-211-center': {},
                'bedroom.FGD-211-edge': {},
                'bedroom.FGRGBWM-441': {},
                
                'hall.FGD-211-center': {},
                'hall.FGD-211-edge': {},
                'hall.FGRGBWM-441': {}
            }
            
            this.devs = {
                'hallway.switch220': { name: [dict.hallway, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['hallway.FGD-211']}, //  FGD-211
                'hallway.light12': { name:  [dict.hallway, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGRGBWM-441']}, //  FGRGBWM-441  (x.2) (1110)
                'hallway.motionSensor': { name:  [dict.hallway, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS-001']}, //  FGMS-001
                'hallway.lightSensor': { name:  [dict.hallway, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS-001']}, //  FGMS-001
                'hallway.tempSensor': { name:  [dict.hallway, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS-001']}, //  FGMS-001
                'hallway.door': { name:  [dict.hallway, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM-441']}, //  FGRGBWM-441  (x.3 или x.5)
                
                'corridor.switch220': { name:  [dict.corridor, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['corridor.FGD-211']}, //  FGD-211
                'corridor.motionSensor': { name:  [dict.corridor, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS-001']}, //  FGMS-001
                'corridor.lightSensor': { name:  [dict.corridor, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS-001']}, //  FGMS-001
                'corridor.tempSensor': { name:  [dict.corridor, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS-001']}, //  FGMS-001
                
                'bathroom.switch220': { name:  [dict.bathroom, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['bathroom.FGD-211']}, //  FGD-211
                'bathroom.motionSensor': { name:  [dict.bathroom, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEON-MS']}, //  Aeon
                'bathroom.lightSensor': { name:  [dict.bathroom, dict.sensor, dict.light], type: this._deviceTypes.default}, hw: this.hwDevs['bathroom.AEON-MS'], //  Aeon
                'bathroom.tempSensor': { name:  [dict.bathroom, dict.sensor, dict.temp], type: this._deviceTypes.default}, hw: this.hwDevs['bathroom.AEON-MS'], //  Aeon
                'bathroom.humSensor': { name:  [dict.bathroom, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEON-MS']}, //  Aeon
                'bathroom.door': { name:  [dict.bathroom, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM-441']}, //  FGRGBWM-441  (x.2) (1110)
                
                'toilet.switch220': { name:  [dict.toilet, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['toilet.FGD-211']}, //  FGD-211
                'toilet.light12': { name:  [dict.toilet, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['toilet.FGRGBWM-441']}, //  FGRGBWM-441  (x.5) (1110)
                'toilet.motionSensor': { name:  [dict.toilet, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEON-MS']}, //  Aeon
                'toilet.lightSensor': { name:  [dict.toilet, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEON-MS']}, //  Aeon
                'toilet.tempSensor': { name:  [dict.toilet, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEON-MS']}, //  Aeon
                'toilet.humSensor': { name:  [dict.toilet, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEON-MS']}, //  Aeon
                'toilet.fan': { name:  [dict.toilet, dict.fan], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.TZ66D']}, // 
                'toilet.door': { name:  [dict.toilet, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM-441']}, //  FGRGBWM-441  (x.3) (1110)
                
                'kitchen.switch220': { name:  [dict.kitchen, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['kitchen.FGD-211']}, //  FGD-211
                'kitchen.light12': { name:  [dict.kitchen, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM-441']}, //  FGRGBWM-441  (x.2) (1110)
                'kitchen.motionSensor': { name:  [dict.kitchen, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS-001']}, //  FGMS-001
                'kitchen.lightSensor': { name:  [dict.kitchen, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS-001']}, //  FGMS-001
                'kitchen.tempSensor': { name:  [dict.kitchen, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS-001']}, //  FGMS-001
                'kitchen.tabletopLight': { name:  [dict.kitchen, dict.light, dict.tabletop], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM-441']}, //  FGRGBWM-441  (x.5)
                'kitchen.tabletopSwitch': { name:  [dict.kitchen, dict.switch_, dict.tabletop], type: this._deviceTypes.tabletopSwitch, hw: this.hwDevs['kitchen.FGRGBWM-441']}, //  FGRGBWM-441  (x.3) (0001)
                'kitchen.door': { name: [dict.kitchen, dict.door], type: this._deviceTypes.virtualDoo, hw: this.hwDevs['kitchen.FGRGBWM-441']},
                
                'wardrobe.switch220': { name:  [dict.wardrobe, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['wardrobe.TZ66D']}, // 
                'wardrobe.door': { name:  [dict.wardrobe, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM-441']}, //  FGRGBWM-441  (x.4)
                
                'bedroom.switch220center': { name:  [dict.bedroom, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD-211-center']}, //  FGD-211
                'bedroom.switch220edge': { name:  [dict.bedroom, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD-211-edge']}, //  FGD-211
                'bedroom.rgb': { name:  [dict.bedroom, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['bedroom.FGRGBWM-441']}, //  FGRGBWM-441 (switchRGBW) (1110 1110 1110)
                'bedroom.w': { name:  [dict.bedroom, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['bedroom.FGRGBWM-441']}, //  FGRGBWM-441 (x.5) (1110)
                
                'hall.switch220center': { name:  [dict.hall, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD-211-center']}, //  FGD-211
                'hall.switch220edge': { name:  [dict.hall, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD-211-edge']}, //  FGD-211
                'hall.rgb': { name:  [dict.hall, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['hall.FGRGBWM-441']}, //  FGRGBWM-441 (switchRGBW) (1110 1110 1110)
                'hall.w': { name: [dict.hall, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hall.FGRGBWM-441']}, // FGRGBWM-441 (x.5) (1110)
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
            }, this);
            
        };



        /** 
         * Производит поиск и инициализацию устройства по ключу
         */
        DeviceStorage.prototype._initDevice = function(key) {
            var devObj = this.devs[key];
            if (!devObj){
                this.log('Error: initDevice(' + key + '): device not determined');
                return;
            }
            
            var vDevs = this._getDevicesByName(devObj.name);
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
                //var parts = key.split('_');
                //var devKey = parts[0];
                //var sceneId = parts[1];
                //if (sceneId === undefined)
                    this._initDevice(key);
                //else
                //    this._initScene(devKey, sceneId);
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
            }, this);

            WebServer.removePanel(this.name);
            DeviceStorage.super_.prototype.stop.apply(this, arguments);
        };

        return new DeviceStorage(config);
    });
