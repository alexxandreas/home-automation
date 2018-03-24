/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Hallway', ['AbstractRoom'], function(AbstractRoom){
   
   function Hallway(config) {
        Hallway.super_.call(this, config);
        this.name = 'Hallway';
        this.log('construcror');

        this.devices = {
            switch220:      'hallway.switch220',
        
            light12:        'hallway.light12',
            motionSensor:   'hallway.motionSensor',
            lightSensor:    'hallway.lightSensor',
            tempSensor:     'hallway.tempSensor',
            
            door:           'hallway.door'
        };
        
        
        this.extRooms = [
        // ванная    
        {
            switch220:      'bathroom.switch220',
            motionSensor:   'bathroom.motionSensor',
            door:           'bathroom.door'
        }, 
        // туалет
        {
            switch220:      'toilet.switch220',
            motionSensor:   'toilet.motionSensor',
            door:           'toilet.door'
        }, 
        // корридор
        {
            switch220:      'corridor.switch220',
            motionSensor:   'corridor.motionSensor',
        }, 
        // кухгя
        {
            switch220:      'kitchen.switch220',
            motionSensor:   'kitchen.motionSensor',
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
        },
        // подъезд
        {
            door:           'hallway.door'
        }
        ];
        
        
        //this.settings = this.settings || {};
        this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        this.settings.intMotionTimeout = 2; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 0.5; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        

        this.init(); 
    }

    inherits(Hallway, AbstractRoom);


    Hallway.prototype.init = function(){
        Hallway.super_.prototype.init.apply(this, arguments);
    };
    
    Hallway.prototype.stop = function(){
        Hallway.super_.prototype.stop.apply(this, arguments);
    };

    return new Hallway();
});

