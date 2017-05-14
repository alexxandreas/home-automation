/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Bedroom', ['AbstractRoom', 'DeviceStorage'], function(AbstractRoom, DeviceStorage){
   
   function Bedroom(config) {
        Bedroom.super_.call(this, config);
        this.name = 'Bedroom';
        this.log('construcror');


        this.devices = {
            switch220center:    'bedroom.switch220center',
            switch220edge:      'bedroom.switch220edge',
            rgb:                'bedroom.rgb', // switchRGBW
            w:                  'bedroom.w'
      
            // switch220:      'bathroom.switch220',
        
            // light12:        'toilet.light12',
            // motionSensor:   'bathroom.motionSensor',
            // lightSensor:    'bathroom.lightSensor',
            // tempSensor:     'bathroom.tempSensor',
            // humSensor:      'bathroom.humSensor',
            // fan:            'toilet.fan',
            
            // door:           'bathroom.door'
            
        };
        
        this.handlersConfig.switch220center = this.onSwitch220centerEvent;
        this.handlersConfig.switch220edge = this.onSwitch220edgeEvent;
        
        
        // this.extRooms = [
        // // прихожая    
        // {
        //     switch220:      'hallway.switch220',
        //     motionSensor:   'hallway.motionSensor',
        //     door:           'bathroom.door'
        // }, 
        // // туалет
        // {
        //     switch220:      'toilet.switch220',
        //     humSensor:      'toilet.humSensor'
        //     //motionSensor:   'toilet.motionSensor',
        //     //door:           'toilet.door'
        // }, 
        // // корридор
        // {
        //     switch220:      'corridor.switch220',
        //     //motionSensor:   'corridor.motionSensor'
        //     //door:           'corridor.door'
        // }, 
        // // кухня
        // {
        //     switch220:      'kitchen.switch220',
        //     //motionSensor:   'kitchen.motionSensor',
        //     //door:           'kitchen.door',
        // },
        // // спальня-center
        // {
        //     switch220:      'bedroom.switch220center'
        // },
        // // спальня-edge
        // {
        //     switch220:      'bedroom.switch220edge'
        // },
        // // холл-center
        // {
        //     switch220:      'hall.switch220center'
        // },
        // // холл-edge
        // {
        //     switch220:      'bedroom.switch220edge'
        // }];
        
        
        //this.settings = this.settings || {};
        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 30; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        
        // this.settings.humidityOnDelta = 30, // разница во влажности для ВКЛЮЧЕНИЯ вентилятора
        // this.settings.humidityOffDelta = 20, // разница во влажности для ВЫКЛЮЧЕНИЯ вентилятора
        // this.settings.fanMaxTimeout = 5     // максимальная продолжинельность работы вентилятора после выключения света, мин

        this.init();
      
    } 

    inherits(Bedroom, AbstractRoom);
    
    

    




    Bedroom.prototype.init = function(){
        Bedroom.super_.prototype.init.apply(this, arguments);
    };
    
    Bedroom.prototype.stop = function(){
        Bedroom.super_.prototype.stop.apply(this, arguments);
    };

    return new Bedroom();
});

