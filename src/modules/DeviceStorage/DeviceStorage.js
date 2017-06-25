/*
global config, inherits, controller, MHA
*/
define('DeviceStorage', ['AbstractModule', 'WebServer', 'UtilsVDev', 'UtilsHWDev'],
    function(AbstractModule, WebServer, UtilsVDev, UtilsHWDev) {

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
            'scene':        { mha: 'default' },
            'switchOnOff':  { mha: 'switchOnOff' }
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
                'hallway.FGD211': new UtilsHWDev.FGD211({configParams:{1:0}}),
                'hallway.FGRGBWM441': new UtilsHWDev.FGRGBWM441({configParams:{
                    14: 61166
                }}),
                'hallway.FGMS001': new UtilsHWDev.FGMS001({configParams:{
                    42: 500
                }}),
                
                'corridor.FGD211': new UtilsHWDev.FGD211(),
                'corridor.FGMS001': new UtilsHWDev.FGMS001({configParams:{
                    42: 50
                }}),
                
                'bathroom.FGD211': new UtilsHWDev.FGD211(),
                'bathroom.AEONMS': new UtilsHWDev.AEONMS(),
                'bathroom.TZ66D': new UtilsHWDev.TZ66D(),
                
                
                'toilet.FGD211': new UtilsHWDev.FGD211(),
                'toilet.AEONMS': new UtilsHWDev.AEONMS(),
                'toilet.FGRGBWM441': new UtilsHWDev.FGRGBWM441({configParams:{
                    14: 61166    
                }}),
                
                'kitchen.FGD211': new UtilsHWDev.FGD211(),
                'kitchen.FGRGBWM441': new UtilsHWDev.FGRGBWM441({configParams:{
                    14: 59534    
                }}),
                'kitchen.FGMS001': new UtilsHWDev.FGMS001({configParams:{
                    1: 20,
                    42: 500
                }}),
                
                'wardrobe.TZ66D': new UtilsHWDev.TZ66D(),
                
                'bedroom.FGD211-center': new UtilsHWDev.FGD211(),
                'bedroom.FGD211-edge': new UtilsHWDev.FGD211(),
                'bedroom.FGRGBWM441': new UtilsHWDev.FGRGBWM441({configParams:{
                    10: 8,
                    11: 65,
                    14: 61166,
                    71: 0
                }}),
                
                'hall.FGD211-center': new UtilsHWDev.FGD211(),
                'hall.FGD211-edge': new UtilsHWDev.FGD211(),
                'hall.FGRGBWM441': new UtilsHWDev.FGRGBWM441({configParams:{

                }})
            }
            
            this.devs = {
                'hallway.switch220': { name: [dict.hallway, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['hallway.FGD211']}, //  FGD211
                'hallway.light12': { name:  [dict.hallway, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
                'hallway.motionSensor': { name:  [dict.hallway, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
                'hallway.lightSensor': { name:  [dict.hallway, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
                'hallway.tempSensor': { name:  [dict.hallway, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
                'hallway.door': { name:  [dict.hallway, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.3 или x.5)
                
                'corridor.switch220': { name:  [dict.corridor, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['corridor.FGD211']}, //  FGD211
                'corridor.motionSensor': { name:  [dict.corridor, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
                'corridor.lightSensor': { name:  [dict.corridor, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
                'corridor.tempSensor': { name:  [dict.corridor, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
                
                'bathroom.switch220': { name:  [dict.bathroom, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['bathroom.FGD211']}, //  FGD211
                'bathroom.motionSensor': { name:  [dict.bathroom, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
                'bathroom.lightSensor': { name:  [dict.bathroom, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
                'bathroom.tempSensor': { name:  [dict.bathroom, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
                'bathroom.humSensor': { name:  [dict.bathroom, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
                'bathroom.door': { name:  [dict.bathroom, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
                
                'toilet.switch220': { name:  [dict.toilet, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['toilet.FGD211']}, //  FGD211
                'toilet.light12': { name:  [dict.toilet, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.5) (1110)
                'toilet.motionSensor': { name:  [dict.toilet, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
                'toilet.lightSensor': { name:  [dict.toilet, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
                'toilet.tempSensor': { name:  [dict.toilet, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
                'toilet.humSensor': { name:  [dict.toilet, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
                'toilet.fan': { name:  [dict.toilet, dict.fan], type: this._deviceTypes.switchOnOff, hw: this.hwDevs['bathroom.TZ66D']}, // 
                'toilet.door': { name:  [dict.toilet, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.3) (1110)
                
                'kitchen.switch220': { name:  [dict.kitchen, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['kitchen.FGD211']}, //  FGD211
                'kitchen.light12': { name:  [dict.kitchen, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
                'kitchen.motionSensor': { name:  [dict.kitchen, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
                'kitchen.lightSensor': { name:  [dict.kitchen, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
                'kitchen.tempSensor': { name:  [dict.kitchen, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
                'kitchen.tabletopLight': { name:  [dict.kitchen, dict.light, dict.tabletop], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.5)
                'kitchen.tabletopSwitch': { name:  [dict.kitchen, dict.switch_, dict.tabletop], type: this._deviceTypes.tabletopSwitch, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.3) (0001)
                'kitchen.door': { name: [dict.kitchen, dict.door], type: this._deviceTypes.virtualDoo, hw: this.hwDevs['kitchen.FGRGBWM441']},
                
                'wardrobe.switch220': { name:  [dict.wardrobe, dict.light], type: this._deviceTypes.switchOnOff, hw: this.hwDevs['wardrobe.TZ66D']}, // 
                'wardrobe.door': { name:  [dict.wardrobe, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.4)
                
                'bedroom.switch220center': { name:  [dict.bedroom, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD211-center']}, //  FGD211
                'bedroom.switch220edge': { name:  [dict.bedroom, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD211-edge']}, //  FGD211
                'bedroom.rgb': { name:  [dict.bedroom, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['bedroom.FGRGBWM441']}, //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
                'bedroom.w': { name:  [dict.bedroom, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['bedroom.FGRGBWM441']}, //  FGRGBWM441 (x.5) (1110)
                
                'hall.switch220center': { name:  [dict.hall, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD211-center']}, //  FGD211
                'hall.switch220edge': { name:  [dict.hall, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD211-edge']}, //  FGD211
                'hall.rgb': { name:  [dict.hall, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['hall.FGRGBWM441']}, //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
                'hall.w': { name: [dict.hall, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hall.FGRGBWM441']}, // FGRGBWM441 (x.5) (1110)
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
            
            // инитим железные устройства после таймаута
            setTimeout((function(){
                Object.keys(this.hwDevs).forEach(function(key) {
                    this.hwDevs[key].applyConfigParams();
                }, this);
            }).bind(this), 5*1000);
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
            try {
                this.initHWDev(key);
            } catch (err) {
                this.log("Error: Unable to init hardware device: " + key + "\n" + err.stack);
            }
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
        
        DeviceStorage.prototype.initHWDev = function(key) {
            
            var hwDev = this.devs[key].hw;
            //if (hwDev.inited) return
            //this.log('initHWDev(' + key + '): hwDev found: ' + !!hwDev);
            
            var vDev = this.getDevice(key);
            
            var realId = this._getRealId(vDev.id);
            
            if (realId == null) return;
            
            hwDev.setId(realId);
            
            // see zway.pdf :: command class: Configuration
            //return zway.devices[21].instances[0].commandClasses[112]
            
            //hwDev.inited = true;
        };
        
        /** Получение id физического устройства */
        DeviceStorage.prototype._getRealId = function(vDevId) {
            //var id = vDev.id;
            //var id = this.vDev.id;
            var res = vDevId.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
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
            }, this);

            WebServer.removePanel(this.name);
            DeviceStorage.super_.prototype.stop.apply(this, arguments);
        };

        return new DeviceStorage(config);
    });
