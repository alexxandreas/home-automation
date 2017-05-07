/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Kitchen', ['AbstractRoom'], function(AbstractRoom){
   
   function Kitchen(config) {
        Kitchen.super_.call(this, config);
        this.name = 'Kitchen';
        this.log('construcror');

        this.devices = {
            switch220:      'kitchen.switch220',
        
            light12:        'kitchen.light12',
            motionSensor:   'kitchen.motionSensor',
            lightSensor:    'kitchen.lightSensor',
            tempSensor:     'kitchen.tempSensor'
            //door:           'hallway.door'
        };
        
        
        this.extRooms = [
        // ванная    
        {
            switch220:      'bathroom.switch220',
            //motionSensor:   'bathroom.motionSensor',
            //door:           'bathroom.door'
        }, 
        // туалет
        {
            switch220:      'toilet.switch220',
            //motionSensor:   'toilet.motionSensor',
            //door:           'toilet.door'
        }, 
        // корридор
        {
            switch220:      'corridor.switch220',
            //motionSensor:   'corridor.motionSensor'
            //door:           'corridor.door'
        }, 
        // прихожая
        {
            switch220:      'hallway.switch220',
            motionSensor:   'hallway.motionSensor',
            door:           'kitchen.door',
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
        this.settings.intMotionTimeout = 2; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 0.5; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        

        this.init();
    }

    inherits(Kitchen, AbstractRoom);


    Kitchen.prototype.init = function(){
        Kitchen.super_.prototype.init.apply(this, arguments);
    };
    
    Kitchen.prototype.stop = function(){
        Kitchen.super_.prototype.stop.apply(this, arguments);
    };

    return new Kitchen();
});

