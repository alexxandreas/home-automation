/*
global config, inherits, controller, MHA
*/

// Корридор
define('Corridor', ['AbstractRoom'], function(AbstractRoom){
   
   function Corridor(config) {
        Corridor.super_.call(this, config);
        this.name = 'Corridor';
        this.log('construcror');

        this.devices = {
            switch220:      'corridor.switch220',
        
            light12:        'hallway.light12',
            motionSensor:   'corridor.motionSensor',
            lightSensor:    'corridor.lightSensor',
            tempSensor:     'corridor.tempSensor'
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
            motionSensor:   'corridor.motionSensor'
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
        }
        ];
        
        
        //this.settings = this.settings || {};
        this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        this.settings.intMotionTimeout = 0.5; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 0.5; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        

        this.init();
    }

    inherits(Corridor, AbstractRoom);


    Corridor.prototype.init = function(){
        Corridor.super_.prototype.init.apply(this, arguments);
    };
    
    Corridor.prototype.stop = function(){
        Corridor.super_.prototype.stop.apply(this, arguments);
    };

    return new Corridor();
});

