/*
global config, inherits, controller, MHA
*/
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
        
        this.extRooms = [{
            switch220:      'bathroom.switch220',
            motionSensor:   'bathroom.motionSensor',
            door:           'bathroom.door'
        }, {
            switch220:      'toilet.switch220',
            motionSensor:   'toilet.motionSensor',
            door:           'toilet.door'
        }, {
            switch220:      'corridor.switch220',
            motionSensor:   'corridor.motionSensor',
            door:           'corridor.door'
        }];
        
        this.settings = this.settings || {};
        this.settings.userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        this.settings.intMotionTimeout: 0.5, // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout: 0.5, // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout: 3, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        

        
    }

    inherits(Hallway, AbstractRoom);


    
    Hallway.prototype.stop = function(){
        Hallway.super_.prototype.stop.apply(this, arguments);
    };

    return new Hallway();
});

