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
            
            this.log('UtilsVDev.FGD211 ' + UtilsVDev.FGD211);
            
            this.hwDevs = {
                'hallway.FGD211': new UtilsHWDev.FGD211({
                    configParams:{
                        1:0
                    },
                    devs: {
                        'hallway.switch220': new UtilsVDev.FGD211({ name: [dict.hallway, dict.light, dict.L220] })
                    }
                }),
                'hallway.FGRGBWM441': new UtilsHWDev.FGRGBWM441({
                    configParams:{
                        14: 61166
                    },
                    devs: {
                        'hallway.light12': new UtilsVDev.DefaultDevice({ name:  [dict.hallway, dict.light, dict.L12] }), //  FGRGBWM441  (x.2) (1110)
                        'hallway.door': new UtilsVDev.Door({ name:  [dict.hallway, dict.door] }), //  FGRGBWM441  (x.3 или x.5)
                        'wardrobe.door': new UtilsVDev.Door({ name:  [dict.wardrobe, dict.door] }) //  FGRGBWM441  (x.4)
                    }
                }),
                'hallway.FGMS001': new UtilsHWDev.FGMS001({
                    configParams:{
                        42: 500
                    },
                    devs: {
                        'hallway.motionSensor': new UtilsVDev.DefaultDevice({ name:  [dict.hallway, dict.sensor, dict.motion] }), //  FGMS001
                        'hallway.lightSensor': new UtilsVDev.DefaultDevice({ name:  [dict.hallway, dict.sensor, dict.light] }), //  FGMS001
                        'hallway.tempSensor': new UtilsVDev.DefaultDevice({ name:  [dict.hallway, dict.sensor, dict.temp] }) //  FGMS001
                    }
                }),
                
                
                'corridor.FGD211': new UtilsHWDev.FGD211({
                    devs: {
                        'corridor.switch220': new UtilsVDev.FGD211({ name:  [dict.corridor, dict.light, dict.L220] }) //  FGD211
                    }
                }),
                'corridor.FGMS001': new UtilsHWDev.FGMS001({
                    configParams:{
                        42: 50
                    },
                    devs: {
                        'corridor.motionSensor': new UtilsVDev.DefaultDevice({ name:  [dict.corridor, dict.sensor, dict.motion] }), //  FGMS001
                        'corridor.lightSensor': new UtilsVDev.DefaultDevice({ name:  [dict.corridor, dict.sensor, dict.light] }), //  FGMS001
                        'corridor.tempSensor': new UtilsVDev.DefaultDevice({ name:  [dict.corridor, dict.sensor, dict.temp] }) //  FGMS001
                    }
                }),
                
                
                'bathroom.FGD211': new UtilsHWDev.FGD211({
                    devs:{
                        'bathroom.switch220': new UtilsVDev.FGD211({ name:  [dict.bathroom, dict.light, dict.L220] }) //  FGD211
                    }
                }),
                'bathroom.AEONMS': new UtilsHWDev.AEONMS({
                    devs:{
                        'bathroom.motionSensor': new UtilsVDev.DefaultDevice({ name:  [dict.bathroom, dict.sensor, dict.motion] }), //  Aeon
                        'bathroom.lightSensor': new UtilsVDev.DefaultDevice({ name:  [dict.bathroom, dict.sensor, dict.light] }), //  Aeon
                        'bathroom.tempSensor': new UtilsVDev.DefaultDevice({ name:  [dict.bathroom, dict.sensor, dict.temp] }), //  Aeon
                        'bathroom.humSensor': new UtilsVDev.DefaultDevice({ name:  [dict.bathroom, dict.sensor, dict.hum] }) //  Aeon
                    }
                }),
                'bathroom.TZ66D': new UtilsHWDev.TZ66D({
                    devs:{
                        'toilet.fan': new UtilsVDev.SwitchOnOff({ name:  [dict.toilet, dict.fan] }) // 
                    }
                }),
                
                
                'toilet.FGD211': new UtilsHWDev.FGD211({
                    devs:{
                        'toilet.switch220': new UtilsVDev.FGD211({ name:  [dict.toilet, dict.light, dict.L220] }) //  FGD211
                    }
                }),
                'toilet.AEONMS': new UtilsHWDev.AEONMS({
                    devs:{
                        'toilet.motionSensor': new UtilsVDev.DefaultDevice({ name:  [dict.toilet, dict.sensor, dict.motion] }), //  Aeon 
                        'toilet.lightSensor': new UtilsVDev.DefaultDevice({ name:  [dict.toilet, dict.sensor, dict.light] }), //  Aeon
                        'toilet.tempSensor': new UtilsVDev.DefaultDevice({ name:  [dict.toilet, dict.sensor, dict.temp] }), //  Aeon
                        'toilet.humSensor': new UtilsVDev.DefaultDevice({ name:  [dict.toilet, dict.sensor, dict.hum] }) //  Aeon
                    }
                }),
                'toilet.FGRGBWM441': new UtilsHWDev.FGRGBWM441({
                    configParams:{
                        14: 61166    
                    },
                    devs:{
                        'bathroom.door': new UtilsVDev.Door({ name:  [dict.bathroom, dict.door] }), //  FGRGBWM441  (x.2) (1110)
                        'toilet.light12': new UtilsVDev.DefaultDevice({ name:  [dict.toilet, dict.light, dict.L12] }), //  FGRGBWM441  (x.5) (1110)
                        'toilet.door': new UtilsVDev.Door({ name:  [dict.toilet, dict.door] }) //  FGRGBWM441  (x.3) (1110)
                    }
                }),
                
                
                'kitchen.FGD211': new UtilsHWDev.FGD211({
                    devs:{
                        'kitchen.switch220': new UtilsVDev.FGD211({ name: [dict.kitchen, dict.light, dict.L220] }) //  FGD211
                    }
                }),
                'kitchen.FGRGBWM441': new UtilsHWDev.FGRGBWM441({
                    configParams:{
                        14: 59534,
                        43: 20
                    },
                    devs:{
                        'kitchen.light12': new UtilsVDev.DefaultDevice({ name:  [dict.kitchen, dict.light, dict.L12] }), //  FGRGBWM441  (x.2) (1110)
                        'kitchen.tabletopLight': new UtilsVDev.DefaultDevice({ name:  [dict.kitchen, dict.light, dict.tabletop] }), //  FGRGBWM441  (x.5)
                        'kitchen.tabletopSwitch': new UtilsVDev.TabletopSwitch({ name:  [dict.kitchen, dict.switch_, dict.tabletop] }), //  FGRGBWM441  (x.3) (0001)
                        'kitchen.door': new UtilsVDev.VirtualDoor({ name: [dict.kitchen, dict.door] })
                    }
                }),
                'kitchen.FGMS001': new UtilsHWDev.FGMS001({
                    configParams:{
                        1: 20,
                        42: 500
                    },
                    devs:{
                        'kitchen.motionSensor': new UtilsVDev.DefaultDevice({ name:  [dict.kitchen, dict.sensor, dict.motion] }), //  FGMS001
                        'kitchen.lightSensor': new UtilsVDev.DefaultDevice({ name:  [dict.kitchen, dict.sensor, dict.light] }), //  FGMS001
                        'kitchen.tempSensor': new UtilsVDev.DefaultDevice({ name:  [dict.kitchen, dict.sensor, dict.temp] }) //  FGMS001
                    }
                }),
                
                
                'wardrobe.TZ66D': new UtilsHWDev.TZ66D({
                    devs:{
                        'wardrobe.switch220': new UtilsVDev.SwitchOnOff({ name:  [dict.wardrobe, dict.light] })
                    }
                }),
                
                
                'bedroom.FGD211-center': new UtilsHWDev.FGD211({
                    devs:{
                        'bedroom.switch220center': new UtilsVDev.FGD211({ name:  [dict.bedroom, dict.light, dict.center] }) //  FGD211
                    }
                }),
                'bedroom.FGD211-edge': new UtilsHWDev.FGD211({
                    devs:{
                        'bedroom.switch220edge': new UtilsVDev.FGD211({ name:  [dict.bedroom, dict.light, dict.edge] }) //  FGD211
                    }
                }),
                'bedroom.FGRGBWM441': new UtilsHWDev.FGRGBWM441({
                    configParams:{
                        10: 8,
                        11: 65,
                        14: 61166,
                        71: 0
                    },
                    devs:{
                        'bedroom.rgb': new UtilsVDev.RGB({ name:  [dict.bedroom, dict.light, dict.rgb] }), //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
                        'bedroom.w': new UtilsVDev.DefaultDevice({ name:  [dict.bedroom, dict.light, dict.L12] }) //  FGRGBWM441 (x.5) (1110)
                    }
                }),
                
                
                'hall.FGD211-center': new UtilsHWDev.FGD211({
                    devs:{
                        'hall.switch220center': new UtilsVDev.FGD211({ name:  [dict.hall, dict.light, dict.center] }) //  FGD211
                    }
                }),
                'hall.FGD211-edge': new UtilsHWDev.FGD211({
                    devs:{
                        'hall.switch220edge': new UtilsVDev.FGD211({ name:  [dict.hall, dict.light, dict.edge] }) //  FGD211
                    }
                }),
                'hall.FGRGBWM441': new UtilsHWDev.FGRGBWM441({
                    configParams:{
                        // 0: 8,
                        // 11: 65,
                        // 14: 61166,
                        // 71: 0
                    },
                    devs:{
                        'hall.rgb': new UtilsVDev.RGB({ name:  [dict.hall, dict.light, dict.rgb] }), //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
                        'hall.w': new UtilsVDev.DefaultDevice({ name: [dict.hall, dict.light, dict.L12] }) // FGRGBWM441 (x.5) (1110)
                    }
                })
            }
            
            // this.devs = {
            //     +'hallway.switch220': { name: [dict.hallway, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['hallway.FGD211']}, //  FGD211
            //     +'hallway.light12': { name:  [dict.hallway, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
            //     +'hallway.motionSensor': { name:  [dict.hallway, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
            //     +'hallway.lightSensor': { name:  [dict.hallway, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
            //     +'hallway.tempSensor': { name:  [dict.hallway, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['hallway.FGMS001']}, //  FGMS001
            //     +'hallway.door': { name:  [dict.hallway, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.3 или x.5)
                
            //     +'corridor.switch220': { name:  [dict.corridor, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['corridor.FGD211']}, //  FGD211
            //     +'corridor.motionSensor': { name:  [dict.corridor, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
            //     +'corridor.lightSensor': { name:  [dict.corridor, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
            //     +'corridor.tempSensor': { name:  [dict.corridor, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['corridor.FGMS001']}, //  FGMS001
                
            //     +'bathroom.switch220': { name:  [dict.bathroom, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['bathroom.FGD211']}, //  FGD211
            //     +'bathroom.motionSensor': { name:  [dict.bathroom, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
            //     +'bathroom.lightSensor': { name:  [dict.bathroom, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
            //     +'bathroom.tempSensor': { name:  [dict.bathroom, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
            //     +'bathroom.humSensor': { name:  [dict.bathroom, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['bathroom.AEONMS']}, //  Aeon
            //     +'bathroom.door': { name:  [dict.bathroom, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
                
            //     +'toilet.switch220': { name:  [dict.toilet, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['toilet.FGD211']}, //  FGD211
            //     +'toilet.light12': { name:  [dict.toilet, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.5) (1110)
            //     +'toilet.motionSensor': { name:  [dict.toilet, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
            //     +'toilet.lightSensor': { name:  [dict.toilet, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
            //     +'toilet.tempSensor': { name:  [dict.toilet, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
            //     +'toilet.humSensor': { name:  [dict.toilet, dict.sensor, dict.hum], type: this._deviceTypes.default, hw: this.hwDevs['toilet.AEONMS']}, //  Aeon
            //     +'toilet.fan': { name:  [dict.toilet, dict.fan], type: this._deviceTypes.switchOnOff, hw: this.hwDevs['bathroom.TZ66D']}, // 
            //     +'toilet.door': { name:  [dict.toilet, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['toilet.FGRGBWM441']}, //  FGRGBWM441  (x.3) (1110)
                
            //     +'kitchen.switch220': { name:  [dict.kitchen, dict.light, dict.L220], type: this._deviceTypes.FGD211, hw: this.hwDevs['kitchen.FGD211']}, //  FGD211
            //     +'kitchen.light12': { name:  [dict.kitchen, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.2) (1110)
            //     +'kitchen.motionSensor': { name:  [dict.kitchen, dict.sensor, dict.motion], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
            //     +'kitchen.lightSensor': { name:  [dict.kitchen, dict.sensor, dict.light], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
            //     +'kitchen.tempSensor': { name:  [dict.kitchen, dict.sensor, dict.temp], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGMS001']}, //  FGMS001
            //     +'kitchen.tabletopLight': { name:  [dict.kitchen, dict.light, dict.tabletop], type: this._deviceTypes.default, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.5)
            //     +'kitchen.tabletopSwitch': { name:  [dict.kitchen, dict.switch_, dict.tabletop], type: this._deviceTypes.tabletopSwitch, hw: this.hwDevs['kitchen.FGRGBWM441']}, //  FGRGBWM441  (x.3) (0001)
            //     +'kitchen.door': { name: [dict.kitchen, dict.door], type: this._deviceTypes.virtualDoor, hw: this.hwDevs['kitchen.FGRGBWM441']},
                
            //     +'wardrobe.switch220': { name:  [dict.wardrobe, dict.light], type: this._deviceTypes.switchOnOff, hw: this.hwDevs['wardrobe.TZ66D']}, // 
            //     +'wardrobe.door': { name:  [dict.wardrobe, dict.door], type: this._deviceTypes.door, hw: this.hwDevs['hallway.FGRGBWM441']}, //  FGRGBWM441  (x.4)
                
            //     +'bedroom.switch220center': { name:  [dict.bedroom, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD211-center']}, //  FGD211
            //     +'bedroom.switch220edge': { name:  [dict.bedroom, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['bedroom.FGD211-edge']}, //  FGD211
            //     +'bedroom.rgb': { name:  [dict.bedroom, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['bedroom.FGRGBWM441']}, //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
            //     +'bedroom.w': { name:  [dict.bedroom, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['bedroom.FGRGBWM441']}, //  FGRGBWM441 (x.5) (1110)
                
            //     +'hall.switch220center': { name:  [dict.hall, dict.light, dict.center], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD211-center']}, //  FGD211
            //     +'hall.switch220edge': { name:  [dict.hall, dict.light, dict.edge], type: this._deviceTypes.FGD211, hw: this.hwDevs['hall.FGD211-edge']}, //  FGD211
            //     +'hall.rgb': { name:  [dict.hall, dict.light, dict.rgb], type: this._deviceTypes.rgb, hw: this.hwDevs['hall.FGRGBWM441']}, //  FGRGBWM441 (switchRGBW) (1110 1110 1110)
            //     +'hall.w': { name: [dict.hall, dict.light, dict.L12], type: this._deviceTypes.default, hw: this.hwDevs['hall.FGRGBWM441']}, // FGRGBWM441 (x.5) (1110)
            // };
            
            // this.devs = {};
            

            
            // массив названий комнат
            // var namesArray = Object.keys(this.devs).map(function(name) {
            //     return name.split('.').shift();
            // });
            // this.rooms = namesArray.filter(function(item, pos) {
            //     return namesArray.indexOf(item) == pos;
            // });


            this.log('initDevices');
            
            this.devices = {};
            
            Object.keys(this.hwDevs).forEach(function(key){
                var hwDev = this.hwDevs[key];
                var devs = hwDev.devs;
                
                Object.keys(devs).forEach(function(devName){
                    //var devConfig = devConfigs[devName];
                    //var realId = 
                    var dev = devs[devName];
                    this.devices[devName] = dev;
                    dev.hwDev = hwDev;
                    
                    dev.initDevice();
                    
                    //this.devs[devName] = devConfig;
                    
                    //this._initDevice(key);
                }, this)
            }, this)
        };



        /** 
         * Производит поиск и инициализацию устройства по ключу
         */
        // DeviceStorage.prototype._initDevice = function(key) {
        //     var devObj = this.devs[key];
        //     if (!devObj){
        //         this.log('Error: initDevice(' + key + '): device not determined');
        //         return;
        //     }
            
        //     var vDevs = this._getDevicesByName(devObj.name);
        //     if (vDevs.length == 0) {
        //         this.log('Error: initDevice(' + key + '): not found: ' + JSON.stringify(this.devs[key].name));
        //         //return null;
        //     }
        //     else if (vDevs.length > 1) {
        //         var text = vDevs.map(function(vDev) {
        //             return vDev.id + '(' + vDev.get('metrics:title') + ')';
        //         }).join(', ');
        //         this.log('Error: initDevice(' + key + '): found ' + vDevs.length + 'devices: ' + text);
        //         //return null;
        //     }
        //     else {
        //         this._pushDevice(key, this.devs[key].type, vDevs[0]);
        //     }
        //     //   this.devices[key] = vDevs[0];
        //     //return vDevs[0];
        // }


        



        // Добавляет vDev в список устройств и инициализирует у него свойство MHA
        // key - ключ из this.devs
        // DeviceStorage.prototype._pushDevice = function(key, type, vDev) {
        //     this.devices[key] = vDev;
        //     UtilsVDev.createMHA(key, type, vDev);
        //     try {
        //         this.initHWDev(key);
        //     } catch (err) {
        //         this.log("Error: Unable to init hardware device: " + key + "\n" + err.stack);
        //     }
        //     //this.log('device ' + key + ' added');
        // };


        DeviceStorage.prototype.getDevice = function(key) {
            if (!key)
                return null;
            // if (!this.devices[key]) {
                
            //     //var parts = key.split('_');
            //     //var devKey = parts[0];
            //     //var sceneId = parts[1];
            //     //if (sceneId === undefined)
            //         this._initDevice(key);
            //     //else
            //     //    this._initScene(devKey, sceneId);
            // }
            
            
            
            if (!this.devices[key])
                return null;
                
            if (!this.devices[key].inited)
                this.devices[key]._initDevice();
                
            if (!this.devices[key].inited)
                return null;
                
            // TODO: Временное решение. Сейчас getDevice возвращает vDev, 
            // должен возвращать инстанс из UtilsVDev
            return this.devices[key].vDev;
        };


        // возвращает vDev по его id
        // DeviceStorage.prototype.getVDev = function(id) {
        //     var vDev = controller.devices.get(id);
        //     return vDev;
        // };
        
        // DeviceStorage.prototype.initHWDev = function(key) {
            
        //     var hwDev = this.devs[key].hw;
        //     //if (hwDev.inited) return
        //     //this.log('initHWDev(' + key + '): hwDev found: ' + !!hwDev);
            
        //     var vDev = this.getDevice(key);
            
        //     var realId = this._getRealId(vDev.id);
            
        //     if (realId == null) return;
            
        //     hwDev.setId(realId);
            
        //     // see zway.pdf :: command class: Configuration
        //     //return zway.devices[21].instances[0].commandClasses[112]
            
        //     //hwDev.inited = true;
        // };
        
        // /** Получение id физического устройства */
        // DeviceStorage.prototype._getRealId = function(vDevId) {
        //     //var id = vDev.id;
        //     //var id = this.vDev.id;
        //     var res = vDevId.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
        //     if (res.length >= 2) return res[1];
        //     return null;
        // };


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
                var dev = this.devices[key];
                dev.destroy();
                // UtilsVDev.destroyMHA(vDev);
            }, this);
            

            WebServer.removePanel(this.name);
            DeviceStorage.super_.prototype.stop.apply(this, arguments);
        };

        return new DeviceStorage(config);
    });
