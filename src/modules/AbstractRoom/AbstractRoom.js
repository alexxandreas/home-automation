/*
global config, inherits, controller, MHA
*/
define('AbstractRoom', [
    'AbstractModule',
    'DeviceStorage',
    'UtilsDeviceHandlers',
    'UtilsTimers',
    'UtilsRoomHelpers'
], function(
    AbstractModule,
    DeviceStorage,
    UtilsDeviceHandler,
    UtilsTimers,
    UtilsRoomHelpers
) {
    /**
     * Логика работы:
     * Входные устройства: 
     * * датчик движения (on / off)
     * * текущее состояние света (on / off)
     * * текущее состояние 220 света
     * * текущее состояние 12 света
     * * 
     * 
     * 
     * Алгоритмы:
     * 
     * * Датчик движения -> on
     * Включить свет
     * 
     * * Датчик движения -> off
     * Для каждой соседней комнаты: проверяем, не ушел ли кто-то в эту комнату
     * + Если дверь закрыта уже больше 20 секунд - игнорируем комнату
     * + Если дверь открыта уже больше 20 секунд - возможно туда кто-то ушел
     * + Если за последние 20 секунд положение двери изменилось
     */

    /**
     * Методы:
     * init() - после конструктора дочернего класса
     * handlers.ddHandler(key, handler) - для подписки на девайс
     * 
     *
     */
    function AbstractRoom(config) {
        AbstractRoom.super_.call(this, config);
        this.name = 'AbstractRoom';
        this.log('construcror');

        /** Общая логика работы
         *   Внутренние устройства:
         *   * switch220
         *   * light12
         *   * motionSensor
         *   * lightSensor
         *   * tempSensor
         *   * humSensor
         *   * door
         * 
         */

        this.handlers = new UtilsDeviceHandler();
        this.timers = new UtilsTimers();
        //this.roomHelpers = new UtilsRoomHelpers();

        //Utils.extend(this, Utils.timers);
        //Utils.extend(this, Utils.deviceHandlers);


        this.devices = {};
        this.extRooms = [];
        this.settings = {};
        // this.devices = {
        //     switch220:      'hallway.switch220',
        //     light12:        'hallway.light12',
        //     motionSensor:   'hallway.motionSensor',
        //     lightSensor:    'hallway.lightSensor',
        //     tempSensor:     'hallway.tempSensor',
        //     humSensor:       ''
        //     fan:            'toilet.fan'
        // };

        // this.extRooms = [{
        //     switch220:      'bathroom.switch220',
        //     motionSensor:   'bathroom.motionSensor',
        //     motionIgnore:   false/true
        //     door:           'bathroom.door',

        // }]


        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 0.5; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 0.5; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении


        this.suitableLightConfig = {
            dayInterval: {
                hStart: 6,
                mStart: 0,
                hEnd: 23,
                mEnd: 59
            } // интервал времени, в который гарантированно будет включаться 220 свет. 
            //   minIlluminationLevel: 0, // уровень освещенности, Lux, выше которого будет гарантированно включаться 220 свет (если не попали в dayInterval).
            //   lightSensorTarget: 'lightSensor', // устройство, отвечающее за датчик освещенности
            //   ext220Targets: 'ext220', // устройства, отвечающие за внешний 220В свет. Если он включен - включится 220, иначе 12
            //   int12Targets: '12' // устройства, отвечающие за 12В свет в текущем помещении. Если таких нет - вернется 220
        };
        
        this.handlersConfig = {
            switch220: this.onSwitch220Event,
            
            // switch220_10: this.onSwitch220SceneUpClick,
            // switch220_11: this.onSwitch220SceneDownClick,
            // switch220_13: this.onSwitch220SceneUpDownRelease,
            // switch220_14: this.onSwitch220SceneUpDoubleClick,
            // switch220_17: this.onSwitch220SceneUpHold,
            // switch220_18: this.onSwitch220SceneDownHold,
            
            //light12:        this.onLight12Event,
            motionSensor: this.onMotionSensorEvent,
            lightSensor: this.onLightSensorEvent,
            tempSensor: this.onTempSensorEvent,
            humSensor: this.onHumSensorEvent,
            //door: this.onDoorEvent
        }

    }

    inherits(AbstractRoom, AbstractModule);

    AbstractRoom.prototype.init = function() {
        this.state = {
            //motionSensor: 'off', // движение внутри ('on', 'off') -> this.getMotionState
            //motionSensorTimeout: 0, // Date.now(); - время изменения значения движения внутри

            userMode: null, // режим работы (null, '12', '220', 'on', 'off')

            extM: 'off', // движение снаружи ('on', 'off') // пока оставляем

            lastLight: null, // последний включенный свет (null, '12', '220'). Восстанавливается, если между выключениями был небольшой интервал


            //intM: 'off', // движение внутри ('on', 'off')
            //intMTimeout: 0, // Date.now(); - время изменения значения движения внутри

            light: null, // свет (null, '12', '220')

            // Если движение снаружи началось после окончания движения внутри - 
            // значит снаружи другой человек. Не реагируем на внешний датчик движения
            extMotions: {}, // id_внешнего_датчика_движения -> {value: ('on'/'off'), ignore: (true/false), changeTime: Date.now()}
            doors: {}, // id_двери -> {value: ('on'/'off'), changeTime: Date.now()}
            someDoorOpened: false, // хотя бы одна дверь открыта
            someDoorClosed: false, // хотя бы одна дверь закрыта

            fanMode: 'off', // состояние вентилятора (для ванной и туалета) ('on', 'off')
            //fanModeTimeout: 0 //  Date.now(); - время изменения значения fanMode
        };


        this._initBaseHandlers();

        this._setInitialState();
    };



    AbstractRoom.prototype._initBaseHandlers = function() {
        // var handlers = {
        //     switch220: this.onSwitch220Event,
            
        //     switch220_10: this.onSwitch220SceneUpClick,
        //     switch220_11: this.onSwitch220SceneDownClick,
        //     switch220_13: this.onSwitch220SceneUpDownRelease,
        //     switch220_14: this.onSwitch220SceneUpDoubleClick,
        //     switch220_17: this.onSwitch220SceneUpHold,
        //     switch220_18: this.onSwitch220SceneDownHold,
            
        //     //light12:        this.onLight12Event,
        //     motionSensor: this.onMotionSensorEvent,
        //     lightSensor: this.onLightSensorEvent,
        //     tempSensor: this.onTempSensorEvent,
        //     humSensor: this.onHumSensorEvent,
        //     //door: this.onDoorEvent
        // };
        
        
        // сцены для выключателя света
        // if (this.devices.switch220){
        //     [10, 11, 13, 14, 17, 18].forEach(function(sceneId){
        //         this.devices['switch220_' + sceneId] = this.devices.switch220 + '_' + sceneId;
        //     }, this);
        // }

        Object.keys(this.handlersConfig).forEach(function(key) {
            if (!this.devices[key]) return;
            if (!this.handlersConfig[key]) return;
            this.handlers.addHandler(this.devices[key], this.handlersConfig[key], this);
        }, this);
           
            
        // ExtRooms
        
        var extRoomsHandlers = {
            //switch220:      this.onExtRoomSwitch220Event,
            motionSensor:   this.onExtRoomMotionSensorEvent,
            door:           this.onExtRoomDoorEvent
        };
              
        this.extRooms.forEach(function(extRoom){
            Object.keys(extRoomsHandlers).forEach(function(key){
                if (!extRoom[key]) return;
                if (!extRoomsHandlers[key]) return;
                var handler = extRoomsHandlers[key].bind(this, extRoom);
                this.handlers.addHandler(extRoom[key], handler, this);
            }, this);
        }, this);
        
    };


    // Установка начальных значений в соответствии с текущим состоянием выключателей / датчиков
    AbstractRoom.prototype._setInitialState = function() {
        // TODO дописать!   
    }


    // подбор подходящего по обстоятельствам света (основной 220, или подсветка 12)
    AbstractRoom.prototype.getSuitableLight = function() {
        // TODO переписать
        return;

        var conf = this.suitableLightConfig;
        if (conf.dayInterval) {
            // Если сейчас день (с 8 до 21) - вернуть '220'. [08:00 22:00]
            var dayInterval = [formatTime(conf.dayInterval.hStart, conf.dayInterval.mStart), formatTime(conf.dayInterval.hEnd, conf.dayInterval.mEnd)];
            var date = new Date();
            var now = formatTime(date.getHours(), date.getMinutes());
            if (dayInterval[0] <= now && dayInterval[1] >= now) {
                this.log('getSuitableLight: 220 (время = ' + now + ' попало в дневной интервал [' + dayInterval[0] + ', ' + dayInterval[1] + '])');
                return '220';
            }
        }

        if ((conf.minIlluminationLevel || conf.minIlluminationLevel === 0) && conf.lightSensorTarget) {
            // Если уровень освещенности в помещении больше 10 Lux - вернуть 220.
            var lightSensorId = this.getTarget(conf.lightSensorTarget);
            var lightSensor = lightSensorId && this.getVDev(lightSensorId);
            if (lightSensor) {
                var illuminationLevel = lightSensor.get("metrics:level");
                if (conf.minIlluminationLevel < illuminationLevel) {
                    this.log('getSuitableLight: 220 (уровень освещености = ' + illuminationLevel + ', минимальный для 220 = ' + conf.minIlluminationLevel + ')');
                    return '220';
                }
            }
        }

        // Если хотя бы в одной соседней комнате горит '220' - вернуть '220'.
        if (conf.ext220Targets) {
            if (!this.getTargets(conf.ext220Targets).length || this.getTargets(conf.ext220Targets).some(function(id) {
                    var vDev = this.getVDev(id);
                    return vDev && vDev.get("metrics:level") > 0;
                }, this)) {
                this.log('getSuitableLight: 220 (внешний 220 свет включен)');
                return '220';
            }
            /*if (!this.getTargets(conf.ext220Targets).length || this.getTargets(conf.ext220Targets).some(function(dev){
            return dev.vDev && dev.vDev.get("metrics:level") > 0;
            })) {
            this.log('getSuitableLight: 220 (внешний 220 свет включен)');
            return '220';
            }*/
        }

        // если есть 12В устройства - то 12В
        /*if (conf.int12Targets){
        if (this.getTargets(conf.int12Targets).length && this.getTargets(conf.int12Targets).some(function(dev){
        return !!dev.vDev;
        })) {
        this.log('getSuitableLight: 12');
        return '12';
        }
        }*/
        if (this.is12TargetsExists()) {
            this.log('getSuitableLight: 12');
            return '12';
        }

        this.log('getSuitableLight: 220 (12В устройства не найдены)');
        return '220';

        function formatTime(h, m) {
            return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
        }
    };



    AbstractRoom.prototype.is12TargetsExists = function() {
        var conf = this.suitableLightConfig;
        return conf.int12Targets && this.getTargets(conf.int12Targets).length && this.getTargets(conf.int12Targets).some(function(id) {
            return !!this.getVDev(id);
            //return !!dev.vDev;
        }, this);
    };


    /**********************************************************/
    /***************** Обертки над roomHelpers ****************/
    /**********************************************************/

    AbstractRoom.prototype.getLightState = function() {
        return UtilsRoomHelpers.getLightState(this.devices.switch220, this.devices.light12);
    };

    AbstractRoom.prototype.getMotionState = function() {
        return UtilsRoomHelpers.getMotionState(this.devices.motionSensor);
    };
    
    AbstractRoom.prototype.getFanState = function() {
        return UtilsRoomHelpers.getFanState(this.devices.fan);
    };

    AbstractRoom.prototype.getExtRoomsMotionState = function() {
        return UtilsRoomHelpers.getExtRoomsMotionState(this.extRooms);
    };

    AbstractRoom.prototype.getExtRoomsDoorsState = function() {
        return UtilsRoomHelpers.getExtRoomsDoorsState(this.extRooms);
    };

    AbstractRoom.prototype.getExtRooms220State = function() {
        return UtilsRoomHelpers.getExtRooms220State(this.extRooms);
    };
    
    AbstractRoom.prototype.getExtRoomsHumState = function() {
        return UtilsRoomHelpers.getExtRoomsHumState(this.extRooms);
    };
    




    // mode = 'on', 'off'
    //AbstractRoom.prototype.switchLight = function(mode){
    // options.mode: 'on', 'off'
    // options.force: true/false - принудительное включение/выключение 
    // options.light: null, '12', '220' - режим света. если не указан - автовыбор
    AbstractRoom.prototype.switchLight = function(options) {

        if (options.mode == 'on') { // включить

            //var currentLightState = this.getLightState();
            var newLightState = {
                '220': 'off',
                '12': 'off'
            };

            // если указали конкретный свет - включаем его
            if (options.light == '12' || options.light == '220') {
                //var light = options.light;
                newLightState[options.light] = 'on';
            }

            // учитываем userMode
            else if (this.state.userMode == '220' || this.state.userMode == '12') {
                //var light = this.state.userMode;
                newLightState[this.state.userMode] = 'on';
            }
            else if (this.state.userMode == 'on') {
                newLightState['220'] = 'on';
                newLightState['12'] = 'on';
            }

            // учитываем последний включенный свет
            else if (this.state.lastLight) {
                newLightState[this.state.lastLight] = 'on';
            }

            // если в соседней комнате горит 220 - тоже включаем 220
            else if (this.getExtRooms220State().summary.level == 'on') {
                newLightState['220'] = 'on';
            }


            //   else if (this.getNextRoom() && this.getNextRoom().api.getCurrentLight() == '12'){
            //     var light = '12';
            //   }

            // учитываем последний включенный свет
            //   else if (this.state.lastLight) {
            //     var light =this.state.lastLight;
            //   } 

            // определяем подходящий свет
            // else { 
            //     var light = this.getSuitableLight();
            // }
            else {
                newLightState['220'] = 'on';
            }

            if (newLightState['220'] == 'on')
                this.state.lastLight = '220';
            else if (newLightState['12'] == 'on')
                this.state.lastLight = '12';

            var dev220 = DeviceStorage.getDevice(this.devices.switch220);
            var dev12 = DeviceStorage.getDevice(this.devices.light12);

            dev220 && dev220.MHA.performCommand(this.name, newLightState['220']);
            dev12 && dev12.MHA.performCommand(this.name, newLightState['12']);

            this.log('switchLight ( ' + JSON.stringify(options) + ' ): newLightState: ' + JSON.stringify(newLightState));

            //   //this.log('switchLight: this.state.light = ' + this.state.light + ', light = ' + light);
            //   if (this.state.light != light){ // если такой свет еще не включен
            //       turn.call(this, light, 'on');
            //       this.state.lastLight = light;
            //       if (this.state.light){ // если включен другой свет
            //           turn.call(this, this.state.light,'off');
            //           this.state.light = light;
            //       } else {
            //           this.state.light = light;
            //           this.onLightOn.call(this); 
            //       }
            //   }

            if (this.getMotionState().level == 'off') {
                this.timers.startTimer('offTimer',
                    this.settings.lightOffTimeout * 60,
                    this.onOffTimer,
                    this,
                    true);
            }

            this.timers.stopTimer('userMode');
            this.timers.stopTimer('clearLastLight');

        }
        else { // выключить

            this.log('switchLight ( ' + JSON.stringify(options) + ' ): newLightState: all off');

            var dev220 = DeviceStorage.getDevice(this.devices.switch220);
            var dev12 = DeviceStorage.getDevice(this.devices.light12);

            dev220 && dev220.MHA.performCommand(this.name, 'off');
            dev12 && dev12.MHA.performCommand(this.name, 'off');

            if (this.state.userMode) // таймер сброса запускаем только когда свет потух
                this.timers.startTimer('userMode', this.settings.userModeTimeout * 60, this.onUserModeTimer, this);
            if (this.state.lastLight)
                this.timers.startTimer('clearLastLight', this.settings.lastLightTimeout * 60, this.onLastLightTimer, this);
        }
    };


    AbstractRoom.prototype.switchFan = function(mode){
        var devFan = DeviceStorage.getDevice(this.devices.fan);
        devFan && devFan.MHA.performCommand(this.name, mode);
    };




    /**********************************************************/
    /************************ HANDLERS ************************/
    /**********************************************************/


    AbstractRoom.prototype.onSwitch220Event = function(event) {
        this.log('onSwitch220Event: ' + JSON.stringify(event));
        if (event.type == 'level'){
            if (event.level == 'on' || event.level > 0)
                this.onSwitch220On(event.level);
            else 
                this.onSwitch220Off(event.level);
        } else if (event.type == 'scene'){
            var handler = 'onSwitch220Scene' + event.name;
            this[handler] && this[handler].call(this);
        }
    };
    
    AbstractRoom.prototype.onSwitch220On = function(level) {
        this.log('onSwitch220On: ' + level);
    };
    
    AbstractRoom.prototype.onSwitch220Off = function(level) {
        this.log('onSwitch220Off: ' + level);
    };


    AbstractRoom.prototype.onMotionSensorEvent = function(event) {
        this.log('onMotionSensorEvent: ' + JSON.stringify(event));

        //if (level == this.state.motionSensor) return;
        //this.state.motionSensor = level;
        //this.state.motionSensorTimeout = Date.now();
        
        this[event.level == 'on' ? 'onMotionSensorOn' : 'onMotionSensorOff'].call(this);
    };

    AbstractRoom.prototype.onMotionSensorOn = function() {
        this.log('onMotionSensorOn. userMode=' + this.state.userMode);

        this.timers.stopTimer('offTimer');

        this.extRooms.forEach(function(room) {
            if (room.motionSensor)
                room.motionIgnore = false;
        }, this);

        if (this.state.userMode != 'off' && this.getLightState().summary.level == 'off')
            this.switchLight({
                mode: 'on'
            });
    };

    AbstractRoom.prototype.onMotionSensorOff = function() {
        this.log('onMotionSensorOff. userMode=' + this.state.userMode);

        if (this.state.userMode == 'on' || this.getLightState().summary.level == 'off') return; // таймер взводим только если режим не on и свет горит

        var timeouts = [];

        // рассчитываем таймаут по внешним датчикам движения
        if (this.state.extM == 'on')
            timeouts.push((this.settings.intMotionTimeout + this.settings.extMotionTimeout) * 60 / 2);
        else {
            // считаем, как давно закончилось движение снаружи
            var min = this.getExtRoomsMotionState().rooms.reduce(function(min, room) {
                if (room.lastLevelChange)
                    min = Math.min(min, room.lastLevelChange)
                return min;
            }, Number.MAX_VALUE);

            if (min < 5 * 1000) { // движение снаружи закончилось меньше, чем 5 секунд назад
                this.log('onMotionSensorOff: движение снаружи закончилось меньше, чем 5 секунд назад');
                timeouts.push(this.settings.extMotionTimeout * 60);
            }
            else {
                timeouts.push(this.settings.intMotionTimeout * 60);
            }
        }

        // рассчитываем таймаут по закрывшимся дверям
        // считаем, как давно закрылась последняя дверь
        var min = this.getExtRoomsDoorsState().rooms.reduce(function(min, room) {
            if (room.level == 'on')
                min = Math.min(min, room.lastLevelChange)
            return min;
        }, Number.MAX_VALUE);

        if (min < 20 * 1000) { // послденяя двень закрылась меньше, чем 15+5 секунд назад
            this.log('onMotionSensorOff: послденяя двень закрылась меньше, чем 15+5 секунд назад');
            timeouts.push(this.settings.extMotionTimeout * 60);
        } // если последняя дверь закрылась позже, чем через 20 секунд - не учитываем двери

        var timeout = Math.min.apply(Math, timeouts);

        this.timers.startTimer('offTimer',
            timeout,
            this.onOffTimer,
            this,
            true);
    };


    AbstractRoom.prototype.onSwitch220SceneUpClick = function() {
        // this.log('onSwitch220SceneUpClick');
        var lightState = this.getLightState(); 
        
        if (lightState.summary.level == 'off'){
            this.log('onSwitch220SceneUpClick: кликнута кнопка Вверх. userMode=>220');
    	    this.state.userMode = '220';
            this.switchLight({mode:'on'});
        } else if (lightState['12'].level == 'on') {
            this.log('onSwitch220SceneUpClick: кликнута кнопка Вверх. userMode=>220');
            this.state.userMode = '220';
            this.switchLight({mode:'on'});
        } else if (lightState['220'].level == 'on') {
            this.log('onSwitch220SceneUpClick: кликнута кнопка Вверх. userMode=>on');
    	    this.state.userMode = 'on';
    	    this.switchLight({mode:'on'});
        }
        
        
    //     if (!this.state.light){
    // 	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>220');
    // 	  this.state.userMode = '220';
    // 	  this.switchLight({mode:'on', force:true, light:'220'});
    // 	} else if (this.state.light == '12'){
    // 	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>220');
    // 	  this.state.userMode = '220';
    // 	  this.switchLight({mode:'on', force:true, light:'220'});
    // 	} else if (this.state.light == '220'){
    // 	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>on');
    // 	  this.state.userMode = 'on';
    // 	}
    };

    AbstractRoom.prototype.onSwitch220SceneDownClick = function() {
        this.log('onSwitch220SceneDownClick');
        var lightState = this.getLightState(); 
        
        if (lightState.summary.level == 'off'){
            this.log('onSwitch220SceneDownClick: кликнута кнопка Вниз. userMode=>off');
    	    this.state.userMode = 'off';
        } else if (lightState['12'].level == 'on'){
            this.log('onSwitch220SceneDownClick: кликнута кнопка Вниз. userMode=>off');
    	    this.state.userMode = 'off';
    	    this.switchLight({mode:'off', force:true});
        } else if (lightState['220'].level == 'on'){
            this.log('onSwitch220SceneDownClick: кликнута кнопка Вниз. userMode=>12');
            this.state.userMode = '12';
            this.switchLight({mode:'on'});
        }
        
        
        
        return;
        
    //     if (!this.state.light){
    // 	  this.log('onButtonDown: кликнута кнопка Вниз. userMode=>off');
    // 	  this.state.userMode = 'off';
    // 	} else if (this.state.light == '12'){
    // 	  this.log('onButtonDown: кликнута кнопка Вниз. userMode=>off');
    // 	  this.state.userMode = 'off';
    // 	  this.switchLight({mode:'off', force:true});
    // 	} else if (this.state.light == '220'){
    //       if (this.is12TargetsExists()){
    //         this.log('onButtonDown: кликнута кнопка Вниз. userMode=>12');
    //         this.state.userMode = '12';
    //         this.switchLight({mode:'on', force:true, light:'12'});
    //       } else {
    //         this.log('onButtonDown: кликнута кнопка Вниз. 12В устройства не найдены. userMode=>off');
    //         this.state.userMode = 'off';
    //         this.switchLight({mode:'off', force:true});
    //       }
    	  
    // 	}
    };

    AbstractRoom.prototype.onSwitch220SceneUpDownRelease = function() {
        this.log('onSwitch220SceneUpDownRelease');
    };

    AbstractRoom.prototype.onSwitch220SceneUpDoubleClick = function() {
        this.log('onSwitch220SceneUpDoubleClick');
    };

    AbstractRoom.prototype.onSwitch220SceneUpHold = function() {
        this.log('onSwitch220SceneUpHold');
    };

    AbstractRoom.prototype.onSwitch220SceneDownHold = function() {
        this.log('onSwitch220SceneDownHold');
    };

            

    AbstractRoom.prototype.onLightSensorEvent = function(event) {
        this.log('onLightSensorEvent: ' + JSON.stringify(event));
    };

    AbstractRoom.prototype.onTempSensorEvent = function(event) {
        this.log('onTempSensorEvent: ' + JSON.stringify(event));
    };


    /**********************************************************/
    /******************* EXT ROOMS HANDLERS *******************/
    /**********************************************************/
    
    AbstractRoom.prototype.onExtRoomMotionSensorEvent = function(extRoom, event) {
        //this.log('onExtRoomMotionSensorEvent: ' + level);
        this[event.level == 'on' ? 'onExtRoomMotionSensorOn' : 'onExtRoomMotionSensorOff'].call(this, extRoom);
    };
    
    AbstractRoom.prototype.onExtRoomMotionSensorOn = function(extRoom) {
        //this.log('onExtRoomMotionSensorOn');
        
        if (this.getLightState().summary.level == 'off') {
            extRoom.motionIgnore = false;
            this.log('onExtRoomMotionSensorOn: userMode='+ this.state.userMode + ' extRoom.motionIgnore => ' + extRoom.motionIgnore + ' (свет выключен)');
        } else if (this.getMotionState().level == 'on') {
            extRoom.motionIgnore = false;
            this.log('onExtRoomMotionSensorOn: userMode='+ this.state.userMode + ' extRoom.motionIgnore => ' + extRoom.motionIgnore + ' (есть движение внутри)');
        } else if (this.getMotionState().lastLevelChange < 5*1000) {
            extRoom.motionIgnore = false;
            this.log('onExtRoomMotionSensorOn: userMode='+ this.state.userMode + ' extRoom.motionIgnore => ' + extRoom.motionIgnore + ' (с конца движения внутри прошло < 5 сек.)');
        } else {
            extRoom.motionIgnore = true;
            this.log('onExtRoomMotionSensorOn: userMode='+ this.state.userMode + ' extRoom.motionIgnore => ' + extRoom.motionIgnore + ' (с конца движения внутри прошло > 5 сек.)');
        }
    };
    
    AbstractRoom.prototype.onExtRoomMotionSensorOff = function(extRoom) {
        this.log('onExtRoomMotionSensorOff userMode='+ this.state.userMode + ' extRoom.motionIgnore ==' + extRoom.motionIgnore);
        if (extRoom.motionIgnore) return;
        if (this.getMotionState().level == 'on') return;
        if (this.state.userMode != 'on' && this.getLightState().summary.level != 'off') {
            // таймер взводим только если режим не on и свет горит 
            this.timers.startTimer(
                'offTimer', 
        		this.settings.extMotionTimeout*60, 
        		this.onOffTimer,
        		this,
        		true
		    );
        }
    };
        
    
    
    AbstractRoom.prototype.onExtRoomDoorEvent = function(extRoom, event) {
        //this.log('onDooonExtRoomDoorEventrEvent: ' + level);
        this[event.level == 'on' ? 'onExtRoomDoorOpen' : 'onExtRoomDoorClose'].call(this, extRoom);
    };
    

    /**
     * Если дверь открылась (любая на периметре помещения) - свет нужно включить
     * Если дверь закрылась - кто-то либо вошел, либо вышел
     *      Если нет движения внутри - выключить свет с минимальным таймаутом
     *      Если есть движение внутри - то по окончании движения посчитать,
     *      как давно закрылась последняя дверь. 
     *          Если меньше, чем 20 секунд назад - выключить свет с минимальным таймаута
     *          Если больше, чем 20 секунд назад - не учитывать двери
    */
    AbstractRoom.prototype.onExtRoomDoorOpen = function(extRoom) {
        this.log('onExtRoomDoorOpen');
        // время последнего изменения двери:
        // var dev = DeviceStorage.getDevice(room.door);
        // var lastLevelChange = dev.MHA.lastLevelChange(true)
        
        if (this.state.userMode != 'off' && this.getLightState().summary.level == 'off'){
    	    this.switchLight({mode:'on'});
            this.timers.startTimer(
                'offTimer', 
                this.settings.intMotionTimeout*60, 
                this.onOffTimer,
                this,
                true
            );
        }
    };

    AbstractRoom.prototype.onExtRoomDoorClose = function(extRoom) {
        this.log('onExtRoomDoorClose');
        if (this.getMotionState().level == 'on') return;
        if (this.state.userMode != 'on' && this.getLightState().summary.level != 'off') {
            // таймер взводим только если режим не on и свет горит 
            this.timers.startTimer('offTimer', 
        		this.settings.extMotionTimeout*60, 
        		this.onOffTimer,
        		this,
        		true
		    );
        }
    };
    
    

    /**********************************************************/
    /************************* TIMERS *************************/
    /**********************************************************/

    AbstractRoom.prototype.onOffTimer = function() { // сработал таймер отключения света
        this.log('onOffTimer: Отключение света по таймеру. userMode=' + this.state.userMode);
        this.timers.stopTimer('offTimer');
        //setOffTimer(null); // сбрасываем таймер
        if (this.state.userMode != 'on')
            this.switchLight({
                mode: 'off'
            });
    };

    AbstractRoom.prototype.onUserModeTimer = function() { // сработал таймер сброса пользовательского режима
        this.log('onUserModeTimer: Сброс userMode по таймеру: ' + this.state.userMode + '=>null');
        //if (this.state.userMode == 'on' && this.state.light){
        // 	if (this.state.light){

        this.state.userMode = null;
        if (this.getLightState().summary.level == 'on') {
            this.switchLight({
                mode: 'off'
            });
        }

    };

    AbstractRoom.prototype.onLastLightTimer = function() { // сработал таймер сброса пользовательского режима
        this.log('onLastLightTimer: Сброс lastLight по таймеру: ' + this.state.lastLight + '=>null');
        this.state.lastLight = null;
    };


    AbstractRoom.prototype.stop = function() {
        this.handlers.stop();
        this.timers.stop();
        //this.roomHelpers.stop();

        AbstractRoom.super_.prototype.stop.apply(this, arguments);
    };

    return AbstractRoom;
});
