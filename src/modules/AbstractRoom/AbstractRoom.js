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
        //     motionIgnore:   false/true, // влияет только на то, будет ли обрабатываться событие окончания движения во внешней комнате
        //     door:           'bathroom.door',

        // }]


        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 0.5; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 0.5; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении


        this.suitableLightConfig = {
            switch220: [{
               start: 6.00,
               end: 23.59
            }],
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
            
            //light12:        this.onLight12Event,
            motionSensor: this.onMotionSensorEvent,
            lightSensor: this.onLightSensorEvent,
            tempSensor: this.onTempSensorEvent,
            humSensor: this.onHumSensorEvent,
            //door: this.onDoorEvent
        }
        
        // Параметры, которые сохраняются в файл при изменении
        this.defaultParameters = {
            switch220Level: 99, // уровень яркости, на который включается 220 свет
            light12Level: 99 // уровень яркости, на который включается 12 свет
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
            
            light12DimDirection: 'off', // направление диммирования 12 света при удержании кнопки Вниз
            light12Dimming: false,
            switch220Dimming: false,




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
        
        var result;
        var conf = this.suitableLightConfig;
        
        // switch220: [{
        //       start: '6.00',
        //       end: '23.59'
        //     }],
        if (conf.switch220 && conf.switch220.length) {
            conf.switch220.forEach(function(interval){
                var date = new Date();
                var now = formatTime(date.getHours(), date.getMinutes());
                if (interval.start <= now && interval.end >= now)
                this.log('getSuitableLight: 220 (время = ' + now + ' попало в дневной интервал [' + interval.start + ', ' + interval.end + '])');
                result = '220';
            }, this);
        } 
        
        // if (conf.dayInterval) {
        //     // Если сейчас день (с 8 до 21) - вернуть '220'. [08:00 22:00]
        //     var dayInterval = [formatTime(conf.dayInterval.hStart, conf.dayInterval.mStart), formatTime(conf.dayInterval.hEnd, conf.dayInterval.mEnd)];
        //     var date = new Date();
        //     var now = formatTime(date.getHours(), date.getMinutes());
        //     if (dayInterval[0] <= now && dayInterval[1] >= now) {
        //         this.log('getSuitableLight: 220 (время = ' + now + ' попало в дневной интервал [' + dayInterval[0] + ', ' + dayInterval[1] + '])');
        //         return '220';
        //     }
        // }
        
        if (result)
            return result;

        if (conf.minIlluminationLevel != undefined) {
            var illuminationLevel = this.getIlluminationState();
            if (!illuminationLevel.deviceNotExists && conf.minIlluminationLevel < illuminationLevel.level) {
                this.log('getSuitableLight: 220 (уровень освещености = ' + illuminationLevel.level + ', минимальный для 220 = ' + conf.minIlluminationLevel + ')');
                return '220'; 
            }
        }
        

        // && conf.lightSensorTarget) {
        //     // Если уровень освещенности в помещении больше 10 Lux - вернуть 220.
        //     var lightSensorId = this.getTarget(conf.lightSensorTarget);
        //     var lightSensor = lightSensorId && this.getVDev(lightSensorId);
        //     if (lightSensor) {
        //         var illuminationLevel = lightSensor.get("metrics:level");
        //         if (conf.minIlluminationLevel < illuminationLevel) {
        //             this.log('getSuitableLight: 220 (уровень освещености = ' + illuminationLevel + ', минимальный для 220 = ' + conf.minIlluminationLevel + ')');
        //             return '220';
        //         }
        //     }
        // }

        // Если хотя бы в одной соседней комнате горит '220' - вернуть '220'.
        // if (conf.ext220Targets) {
        //     if (!this.getTargets(conf.ext220Targets).length || this.getTargets(conf.ext220Targets).some(function(id) {
        //             var vDev = this.getVDev(id);
        //             return vDev && vDev.get("metrics:level") > 0;
        //         }, this)) {
        //         this.log('getSuitableLight: 220 (внешний 220 свет включен)');
        //         return '220';
        //     }
        // }

        // если есть 12В устройства - то 12В
        /*if (conf.int12Targets){
        if (this.getTargets(conf.int12Targets).length && this.getTargets(conf.int12Targets).some(function(dev){
        return !!dev.vDev;
        })) {
        this.log('getSuitableLight: 12');
        return '12';
        }
        }*/
        // if (this.is12TargetsExists()) {
        //     this.log('getSuitableLight: 12');
        //     return '12';
        // }

        //this.log('getSuitableLight: 220 (12В устройства не найдены)');
        //return '220';
        this.log('getSuitableLight: 12');
        return '12';

        function formatTime(h, m) {
            // return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
            return h + m/100;
        }
    };



    /**********************************************************/
    /***************** Обертки над roomHelpers ****************/
    /**********************************************************/

    AbstractRoom.prototype.getLightState = function() {
        return UtilsRoomHelpers.getLightState({switch220: this.devices.switch220, light12:this.devices.light12});
    };

    AbstractRoom.prototype.getMotionState = function() {
        //return UtilsRoomHelpers.getMotionState(this.devices.motionSensor);
        return UtilsRoomHelpers.getDeviceData(this.devices.motionSensor);
    };
    
    AbstractRoom.prototype.getFanState = function() {
        //return UtilsRoomHelpers.getFanState(this.devices.fan);
        return UtilsRoomHelpers.getDeviceData(this.devices.fan);
    };
    
    AbstractRoom.prototype.getIlluminationState = function() {
        //return UtilsRoomHelpers.getFanState(this.devices.fan);
        return UtilsRoomHelpers.getDeviceData(this.devices.lightSensor);
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

        var lightConfig = {
            switch220: {
                command: 'off',
                args: undefined,
                vDev: DeviceStorage.getDevice(this.devices.switch220)
            },
            light12: {
                command: 'off',
                args: undefined,
                vDev: DeviceStorage.getDevice(this.devices.light12)
            },
        }

        if (options.mode == 'on') { // включить

            // var newLightState = {
            //     '220': 'off',
            //     '12': 'off'
            // };
            
            // если указали конкретный свет - включаем его
            // if (options.light == '12' || options.light == '220') {
            //     newLightState[options.light] = 'on';
            // }
            if (options.light == '220') {
                this.log('switchLight(on): options.light == 220 => 220 on');
                lightConfig.switch220.command = 'on';
            } 
            else if (options.light == '12') {
                this.log('switchLight(on): options.light == 12 => 12 on');
                lightConfig.light12.command = 'on';
            }

            // учитываем userMode
            else if (this.state.userMode == '220') {
                this.log('switchLight(on): state.userMode == 220 => 220 on');
                lightConfig.switch220.command = 'on';
                //newLightState[this.state.userMode] = 'on';
            }
            else if (this.state.userMode == '12') {
                this.log('switchLight(on): state.userMode == 12 => 12 on');
                lightConfig.light12.command = 'on';
            }
            else if (this.state.userMode == 'on') {
                this.log('switchLight(on): state.userMode == on => 220 on, 12 on');
                // newLightState['220'] = 'on';
                // newLightState['12'] = 'on';
                lightConfig.switch220.command = 'on';
                lightConfig.light12.command = 'on';
            }

            // учитываем последний включенный свет
            // else if (this.state.lastLight) {
            //     newLightState[this.state.lastLight] = 'on';
            // }
            else if (this.state.lastLight == '220') {
                this.log('switchLight(on): state.lastLight == 220 => 220 on');
                lightConfig.switch220.command = 'on';
            }
            else if (this.state.lastLight == '12') {
                this.log('switchLight(on): state.lastLight == 12 => 12 on');
                lightConfig.light12.command = 'on';
            }
            
            // если в соседней комнате горит 220 - тоже включаем 220
            else if (this.getExtRooms220State().summary.levelOnOff == 'on') {
                this.log('switchLight(on): getExtRooms220State().summary.levelOnOff == on => 220 on');
                //newLightState['220'] = 'on';
                lightConfig.switch220.command = 'on';
            } 
            
            // свет 220 в соседней комнате был выключен менее 10 секунд назад
            else if (this.getExtRooms220State().summary.lastLevelChange < 10*1000) {
                this.log('switchLight(on): getExtRooms220State().summary.lastLevelChange < 10*1000 => 220 on');
                // newLightState['220'] = 'on';
                lightConfig.switch220.command = 'on';
            }
            
            // определяем подходящий свет
            // else { 
            //     var light = this.getSuitableLight();
            // }
            else {
                var light = this.getSuitableLight();
                this.log('switchLight(on): getSuitableLight() => ' + light + ' on');
                if (light == '12'){
                    lightConfig.light12.command = 'on';
                } else {
                    lightConfig.switch220.command = 'on';
                }
                //newLightState['220'] = 'on';
            }

            if (lightConfig.light12.command == 'on' && !lightConfig.light12.vDev){
                lightConfig.light12.command = 'off';
                lightConfig.switch220.command = 'on';
            }
            

            // if (lightConfig.switch220.command == 'on')
            //     this.state.lastLight = '220';
            // else if (lightConfig.light12.command == 'on')
            //     this.state.lastLight = '12';
            
            if (lightConfig.light12.command == 'on'){
                this.state.lastLight = '12';
                lightConfig.light12.command = 'exact';
                lightConfig.light12.args = {level: this.getParameter('light12Level')};
            }
            if (lightConfig.switch220.command == 'on'){
                this.state.lastLight = '220';
                lightConfig.switch220.command = 'exact';
                lightConfig.switch220.args = {level: this.getParameter('switch220Level')};
            }
  
            // var dev220 = DeviceStorage.getDevice(this.devices.switch220);
            // var dev12 = DeviceStorage.getDevice(this.devices.light12);

            // if (newLightState['220'] == 'on'){
            //     dev220 && dev220.MHA.performCommand(this.name, 'exact', this.getParameter('switch220Level'));
            // } else {
            //     dev220 && dev220.MHA.performCommand(this.name, 'off');
            // }
            
            lightConfig.switch220.vDev && lightConfig.switch220.vDev.MHA.performCommand(this.name, lightConfig.switch220.command, lightConfig.switch220.args);
            lightConfig.light12.vDev && lightConfig.light12.vDev.MHA.performCommand(this.name, lightConfig.light12.command, lightConfig.light12.args);
            
            
            //dev220 && dev220.MHA.performCommand(this.name, newLightState['220']);
            //dev12 && dev12.MHA.performCommand(this.name, newLightState['12']);
            delete lightConfig.switch220.vDev;
            delete lightConfig.light12.vDev;

            this.log('switchLight ( ' + JSON.stringify(options) + ' ): newLightState: ' + JSON.stringify(lightConfig));


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

            // var dev220 = DeviceStorage.getDevice(this.devices.switch220);
            // var dev12 = DeviceStorage.getDevice(this.devices.light12);

            // dev220 && dev220.MHA.performCommand(this.name, 'off');
            // dev12 && dev12.MHA.performCommand(this.name, 'off');
            
            lightConfig.switch220.vDev && lightConfig.switch220.vDev.MHA.performCommand(this.name, lightConfig.switch220.command, lightConfig.switch220.args);
            lightConfig.light12.vDev && lightConfig.light12.vDev.MHA.performCommand(this.name, lightConfig.light12.command, lightConfig.light12.args);
            

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

        // if (this.state.userMode != 'off' && this.getLightState().summary.levelOnOff == 'off')
        if (this.state.userMode != 'off')
            this.switchLight({
                mode: 'on'
            });
    };

    AbstractRoom.prototype.onMotionSensorOff = function() {
        this.log('onMotionSensorOff. userMode=' + this.state.userMode);

        if (this.state.userMode == 'on' || this.getLightState().summary.levelOnOff == 'off') return; // таймер взводим только если режим не on и свет горит

        var timeouts = [];

        // рассчитываем таймаут по внешним датчикам движения
        if (this.state.extM == 'on')
            timeouts.push((this.settings.intMotionTimeout + this.settings.extMotionTimeout) * 60 / 2);
        else {
            // считаем, как давно закончилось движение снаружи
            // var min = this.getExtRoomsMotionState().rooms.reduce(function(min, room) {
            //     if (room.lastLevelChange)
            //         min = Math.min(min, room.lastLevelChange)
            //     return min;
            // }, Number.MAX_VALUE);
            var min = this.getExtRoomsMotionState().summary.lastLevelChange || Number.MAX_VALUE;

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
        // var min = this.getExtRoomsDoorsState().rooms.reduce(function(min, room) {
        //     if (room.level == 'on')
        //         min = Math.min(min, room.lastLevelChange)
        //     return min;
        // }, Number.MAX_VALUE);
        var min = this.getExtRoomsDoorsState().summary.lastLevelChange || Number.MAX_VALUE;

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
        
        if (lightState.switch220.levelOnOff == 'off' || lightState.switch220.lastLevelChange < 2*1000) {
            // 220 еще не горит или только что включился - значит в момент нажатия он еще не горел
            this.log('onSwitch220SceneUpClick: кликнута кнопка Вверх. userMode=>220');
    	    this.state.userMode = '220';
            this.switchLight({mode:'on'});
        } else {
            this.log('onSwitch220SceneUpClick: кликнута кнопка Вверх. userMode=>on');
    	    this.state.userMode = 'on';
    	    this.switchLight({mode:'on'});
        }
        
    };

    AbstractRoom.prototype.onSwitch220SceneDownClick = function() {
        this.log('onSwitch220SceneDownClick');
        var lightState = this.getLightState(); 
        
        if (lightState.switch220.levelOnOff == 'on' || lightState.switch220.lastLevelChange < 2*1000) {
            // 220 еще горит или только что погас - значит в момент нажатия он еще горел
            this.log('onSwitch220SceneDownClick: кликнута кнопка Вниз. userMode=>12');
            this.state.userMode = '12';
            this.switchLight({mode:'on'});
        } else { //if (lightState['12'].nextLevel == 'on') {
            // 12 горит и не собирается тухнуть)
            this.log('onSwitch220SceneDownClick: кликнута кнопка Вниз. userMode=>off');
    	    this.state.userMode = 'off';
    	    this.switchLight({mode:'off', force:true});
        }
       
    };

    

    AbstractRoom.prototype.onSwitch220SceneUpDoubleClick = function() {
        this.log('onSwitch220SceneUpDoubleClick');
        this.state.userMode = '220';
        this.setParameter('switch220Level', '99');
        this.switchLight({mode:'on'});
    };

    AbstractRoom.prototype.onSwitch220SceneUpHold = function() {
        this.log('onSwitch220SceneUpHold');
    
        this.state.switch220Dimming = true;
    };

    AbstractRoom.prototype.onSwitch220SceneDownHold = function() {
        this.log('onSwitch220SceneDownHold');
        var lightState = this.getLightState(); 
        
        if (lightState.switch220.levelOnOff == 'off' || lightState.switch220.lastLevelChange < 2*1000) {
            // 220 еще не горит или только что включился - значит в момент нажатия он еще не горел
            if (lightState.light12.nextLevelOnOff == 'on') {
                // 12 включен - можно диммировать
                this.switchLight({mode: 'on', light: '12'}); // выключаем 220. пока так
                this.state.light12Dimming = true;
                this.startDim({
                    direction: this.state.light12DimDirection,
                    currentLevel: lightState.light12.level,
                    minLevel: 1,
                    maxLevel: 99,
                    callback: function(level){ 
                        this.setParameter('light12Level', level);
                        this.switchLight({mode: 'on', light: '12'}); 
                    }
                });
            }
        }
        
        if (lightState.switch220.levelOnOff == 'on' && lightState.switch220.lastLevelChange > 2*1000) {
            // 220 горит давно (если он был выключен - то диммирование вниз его включит, но время будет меньше 2с)
            this.state.switch220Dimming = true;
        }
    };
    
    AbstractRoom.prototype.onSwitch220SceneUpDownRelease = function() {
        this.log('onSwitch220SceneUpDownRelease');
        if (this.state.light12Dimming) {
            this.state.light12Dimming = false;
            this.stopDim();
            this.state.light12DimDirection = this.state.light12DimDirection == 'off' ? 'on' : 'off';
            var level = this.getLightState().light12.level;
            this.setParameter('light12Level', level);
        }
        if (this.state.switch220Dimming) {
            this.state.switch220Dimming = false;
            //this.stopDim();
            var level = this.getLightState().switch220.level;
            this.setParameter('switch220Level', level);
        }
    };
    
    
    AbstractRoom.prototype.setParameter = function(name, value) {
    
    }
    
    AbstractRoom.prototype.getParameter = function(name) {
    
    }

            

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
        
        if (this.getLightState().summary.levelOnOff == 'off') {
            extRoom.motionIgnore = false;
            this.log('onExtRoomMotionSensorOn: userMode='+ this.state.userMode + ' extRoom.motionIgnore => ' + extRoom.motionIgnore + ' (свет выключен)');
        } else if (this.getMotionState().levelOnOff == 'on') {
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
        
        if (this.state.userMode != 'off' && this.getLightState().summary.levelOnOff == 'off'){
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
        if (this.state.userMode != 'on' && this.getLightState().summary.levelOnOff != 'off') {
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
        if (this.getLightState().summary.levelOnOff == 'on') {
            this.switchLight({
                mode: 'off'
            });
        }

    };

    AbstractRoom.prototype.onLastLightTimer = function() { // сработал таймер сброса пользовательского режима
        this.log('onLastLightTimer: Сброс lastLight по таймеру: ' + this.state.lastLight + '=>null');
        this.state.lastLight = null;
    };
    
    
    /**
     * Запускает диммирование по несколько процентов вверх или вниз
     * options.direction: 'on' / 'off'
     * options.currentLevel: 0..100
     * [options.minLevel]: 0..100
     * [options.maxLevel]: 0..100
     * options.callback: function(level)
     * 
     */
    AbstractRoom.prototype.startDim = function(options) {
        this.log('startDim(' + (options.direction == 'on' ? 'startUp' : 'startDown') + ')');
        this.stopDim();
        
        //var timeout = 1; // время в с, через которое будет повторное изенение яркости
        //var deltaLevel = 10; // дельта, на которую меняется яркость за одну итерацию
        
        var timeout = 0.5; // время в с, через которое будет повторное изенение яркости
        var deltaLevel = 5; // дельта, на которую меняется яркость за одну итерацию
        
        var level = options.currentLevel;
        var maxLevel = options.maxLevel || 100;
        var minLevel = options.minLevel || 0;
        
        onTimer.call(this);
        
        function onTimer(){
            if (options.direction == 'on') {
                //this.state.useMinBr = false;
                //if (this.state.rgbBr == 100) return;
                if (level >= maxLevel) return;
                var newLevel = Math.min(level+deltaLevel, maxLevel)
                this.log('change brightness: ' + level + ' -> ' + newLevel);
                // this.log('change brightness: ' + this.state.rgbBr + ' -> ' + Math.min(this.state.rgbBr+10, 100));
                level = newLevel;
                options.callback.call(this, level);
                //this.onRGB();
                this.timers.startTimer('dimTimer', timeout, onTimer, this);
            } else {
                //var minBr = this.getMinBr(this.colors[this.state.colorIndex]);
                
                if (this.state.rgbBr <= minLevel) {
                    //this.state.useMinBr = true;
                    return;
                }
                var newLevel = Math.max(level-deltaLevel, minLevel);
                this.log('change brightness: ' + level + ' -> ' + newLevel);
                level = newLevel;
                // if (this.state.rgbBr == minBr)
                //   this.state.useMinBr = true;
                options.callback.call(this, level);
                //this.onRGB();
                this.timers.startTimer('dimTimer', timeout, onTimer, this);
            }
        }
    };
    
    AbstractRoom.prototype.stopDim = function() {
        this.timers.stopTimer('dimTimer');  
    };
    
    
    AbstractRoom.prototype.getParameter = function(key){
        var data;
        if (!this._parametersLoaded)
            this._loadParameters();
            
        data = this._parameters[key];
        
        if (data === undefined)
            data = this.defaultParameters[key];
            
        this.log('getParameter('+key+'): ' + JSON.stringify(data));
        return data;
    }
        
    AbstractRoom.prototype.setParameter = function(key, data){
        if (!this._parametersLoaded)
            this._loadParameters();
        this._parameters[key] = data;
        this.saveData('parameters', this._parameters);
        this.log('setParameter('+key+', ' + JSON.stringify(data) + ')');
    }
    
    AbstractRoom.prototype._loadParameters = function(){
        this._parameters = this.loadData('parameters') || {};
        this._parametersLoaded = true;
    }
    

    AbstractRoom.prototype.stop = function() {
        this.handlers.stop();
        this.timers.stop();
        //this.roomHelpers.stop();

        AbstractRoom.super_.prototype.stop.apply(this, arguments);
    };

    return AbstractRoom;
});
