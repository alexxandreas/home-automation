/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Bathroom', ['AbstractRoom', 'DeviceStorage'], function(AbstractRoom, DeviceStorage){
   
   function Bathroom(config) {
        Bathroom.super_.call(this, config);
        this.name = 'Bathroom';
        this.log('construcror');

        this.devices = {
            switch220:      'bathroom.switch220',
        
            light12:        'toilet.light12',
            motionSensor:   'bathroom.motionSensor',
            lightSensor:    'bathroom.lightSensor',
            tempSensor:     'bathroom.tempSensor',
            humSensor:      'bathroom.humSensor',
            fan:            'toilet.fan',
            
            door:           'bathroom.door'
        };
        
        
        this.extRooms = [
        // прихожая    
        {
            switch220:      'hallway.switch220',
            motionSensor:   'hallway.motionSensor',
            door:           'bathroom.door'
        }, 
        // туалет
        {
            switch220:      'toilet.switch220',
            humSensor:      'toilet.humSensor'
            //motionSensor:   'toilet.motionSensor',
            //door:           'toilet.door'
        }, 
        // корридор
        {
            switch220:      'corridor.switch220',
            //motionSensor:   'corridor.motionSensor'
            //door:           'corridor.door'
        }, 
        // кухня
        {
            switch220:      'kitchen.switch220',
            //motionSensor:   'kitchen.motionSensor',
            //door:           'kitchen.door',
        },
        // спальня-center
        {
            switch220:      'bedroom.switch220center'
        },
        // спальня-edge
        {
            switch220:      'bedroom.switch220edge'
        },
        // холл-center
        {
            switch220:      'hall.switch220center'
        },
        // холл-edge
        {
            switch220:      'bedroom.switch220edge'
        }];
        
        
        //this.settings = this.settings || {};
        this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        this.settings.intMotionTimeout = 30; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        
        this.settings.humidityOnDelta = 30, // разница во влажности для ВКЛЮЧЕНИЯ вентилятора
        this.settings.humidityOffDelta = 20, // разница во влажности для ВЫКЛЮЧЕНИЯ вентилятора
        this.settings.fanMaxTimeout = 5     // максимальная продолжинельность работы вентилятора после выключения света, мин

        this.init();
      
    } 

    inherits(Bathroom, AbstractRoom);

    Bathroom.prototype.onHumSensorEvent = function(event){
        //this.log('onHumidityChanged()');
        //var intHumiditySensorId = this.getTarget('intHumiditySensor');
        // var intHumiditySensor = intHumiditySensorId && this.getVDev(intHumiditySensorId);
        
        var extRoomsHumLevels = this.getExtRoomsHumState().rooms.reduce(function(result, room) {
            if (!room.level) return result;
            result.sumLevels += room.level;
            result.count++;
            return result;
        }, {
            sumLevels: 0,
            count: 0
        });
        
        if (!extRoomsHumLevels.count) return;
        var extRoomsHumLevel = extRoomsHumLevels.sumLevels / extRoomsHumLevels.count;
        
        
        if (this.getFanState().level == 'on') {
            if (event.level - extRoomsHumLevel < this.settings.humidityOffDelta) {
                this.switchFan('off');
                this.timers.stopTimer('fanStopTimer');
            }
        } else { // вентилятор выключен
            if (this.getLightState().summary.levelOnOff === 'off') return;
            if(event.level - extRoomsHumLevel > this.settings.humidityOnDelta) {
                this.switchFan('on');
            }
        }
        
    };
  
    Bathroom.prototype.onSwitch220Off = function(){
        Bathroom.super_.prototype.onSwitch220Off.apply(this, arguments);
        if (this.getFanState().level == 'on') {
            this.timers.startTimer(
                'fanStopTimer', 
                this.settings.fanMaxTimeout*60, 
                this.onFanStopTimer,
                this);
        }
    };
    
    Bathroom.prototype.onSwitch220On = function(){
        Bathroom.super_.prototype.onSwitch220On.apply(this, arguments);
        this.timers.stopTimer('fanStopTimer');
        if (this.getFanState().level == 'off') {
            var devHum = DeviceStorage.getDevice(this.devices.humSensor);
            var currentHum = devHum && devHum.MHA.getLevel();
            if (currentHum)
                this.onHumSensorEvent({level:currentHum});
        }
    };
    
    Bathroom.prototype.onFanStopTimer = function(){ // сработал таймер ВЫКЛЮЧЕНИЯ вентилятора
        this.log('onFanStopTimer()');
        this.switchFan('off');
    };
    
    





    Bathroom.prototype.init = function(){
        Bathroom.super_.prototype.init.apply(this, arguments);
    };
    
    Bathroom.prototype.stop = function(){
        Bathroom.super_.prototype.stop.apply(this, arguments);
    };

    return new Bathroom();
});

