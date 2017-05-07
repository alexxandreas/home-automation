/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Toilet', ['AbstractRoom'], function(AbstractRoom){
   
   function Toilet(config) {
        Toilet.super_.call(this, config);
        this.name = 'Toilet';
        this.log('construcror');

        this.devices = {
            switch220:      'toilet.switch220',
        
            light12:        'toilet.light12',
            motionSensor:   'toilet.motionSensor',
            lightSensor:    'toilet.lightSensor',
            tempSensor:     'toilet.tempSensor',
            humSensor:      'toilet.humSensor',
            fan:            'toilet.fan',
            
            door:           'toilet.door'
        }; 
        
        
        this.extRooms = [
        // ванная    
        {
            switch220:      'bathroom.switch220',
            // motionSensor:   'bathroom.motionSensor',
            // door:           'bathroom.door'
        }, 
        // прихожая
        {
            switch220:      'hallway.switch220',
            motionSensor:   'hallway.motionSensor',
            door:           'toilet.door'
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
        this.settings.intMotionTimeout = 10; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        
        this.settings.fanStartDelay = 1.5;    // задержка включения вентилятора после включения света, мин
        this.settings.fanMaxTimeout = 5;     // максимальная продолжинельность работы вентилятора после выключения света, мин
        
        this.init();
    }

    inherits(Toilet, AbstractRoom);


    // Режим работы вентилятора:
    // this.state.someDoorClosed = false;
    // this.state.someDoorOpened = false;
    
    // * свет включился и дверь закрыта и fanMode == 'off'
    // * или дверь закрылась и свет включен и fanMode == 'off'
    // ==> начать отсчет времени this.startTimer('fanStartTimer', 30)
    
    // * свет выключился
    // * или дверь открылась
    // ==> this.stopTimer('fanStartTimer')
    
    // * onFanStartTimer
    // ==> включить венрилятор this.switchFan('on')
    
    // * свет выключился и fanMode == 'on'
    // ==> начать отсчет времени this.startTimer('fanStopTimer', Math.min(Date.now()-state.fanModeTimeout, 5минут))
    
    // * дверь открылась и fanMode == 'on'
    // ==> начать отсчет времени this.startTimer('fanStopTimer', Math.min(Date.now()-state.fanModeTimeout, 5минут))
    

    // * onFanStopTimer
    // ==> выключить венрилятор this.switchFan('off')



    Toilet.prototype.onSwitch220On = function(level){
        Toilet.super_.prototype.onSwitch220On.apply(this, arguments);
        
        this.timers.stopTimer('fanStopTimer');
        
        if (this.getExtRoomsDoorsState().summary.level === 'on')
            return; // при открытой двери вентилятор не включаем
        
        if (this.getFanState().level === 'on') return;
        
        this.timers.startTimer(
            'fanStartTimer',
            this.settings.fanStartDelay*60,
            this.onFanStartTimer,
            this,
            true);
    };
  
    Toilet.prototype.onSwitch220Off = function(level){
        Toilet.super_.prototype.onSwitch220Off.apply(this, arguments);
        
        this.timers.stopTimer('fanStartTimer');
        
        if (this.getFanState().level === 'on'){
            this.timers.startTimer(
                'fanStopTimer', 
                // Math.min((Date.now()-this.state.fanModeTimeout)/1000, this.settings.fanMaxTimeout*60), 
                Math.min(this.getFanState().lastLevelChange/1000, this.settings.fanMaxTimeout*60), 
                this.onFanStopTimer,
                this
            );
        }
    };
  
  
  
    Toilet.prototype.onExtRoomDoorOpen = function(){
        Toilet.super_.prototype.onExtRoomDoorOpen.apply(this, arguments);
        
        this.timers.stopTimer('fanStartTimer');
        if (this.getFanState().level === 'on'){
            this.startTimer(
                'fanStopTimer', 
                //Math.min((Date.now()-this.state.fanModeTimeout)/1000, this.settings.fanMaxTimeout*60), 
                Math.min(this.getFanState().lastLevelChange/1000, this.settings.fanMaxTimeout*60), 
                this.onFanStopTimer,
                this
            );
            
        }
    }
  
    Toilet.prototype.onExtRoomDoorClose = function(){
        Toilet.super_.prototype.onExtRoomDoorClose.apply(this, arguments);
        
        this.timers.stopTimer('fanStopTimer');
        if (this.getLightState().summary.level === 'off') 
            return; // при выключенном свете вентилятор не включаем
        if (this.getFanState().level === 'on')
            return;
            
        this.timers.startTimer(
            'fanStartTimer', 
            this.settings.fanStartDelay*60, 
            this.onFanStartTimer,
            this
        );
    }
  
  
    Toilet.prototype.onFanStartTimer = function(){ // сработал таймер ВКЛЮЧЕНИЯ вентилятора
        this.log('onFanStartTimer()');
        this.switchFan('on');
    };
  
    Toilet.prototype.onFanStopTimer = function(){ // сработал таймер ВЫКЛЮЧЕНИЯ вентилятора
        this.log('onFanStopTimer()');
        this.switchFan('off');
    };
  
  
  

    Toilet.prototype.init = function(){
        Toilet.super_.prototype.init.apply(this, arguments);
    };
    
    Toilet.prototype.stop = function(){
        Toilet.super_.prototype.stop.apply(this, arguments);
    };

    return new Toilet();
});

