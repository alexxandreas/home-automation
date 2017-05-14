/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Wardrobe', ['AbstractRoom'], function(AbstractRoom){
   
   function Wardrobe(config) {
        Wardrobe.super_.call(this, config);
        this.name = 'Wardrobe';
        this.log('construcror');

        this.devices = {
            switch220:      'wardrobe.switch220',
        
            // light12:        'toilet.light12',
            // motionSensor:   'toilet.motionSensor',
            // lightSensor:    'toilet.lightSensor',
            // tempSensor:     'toilet.tempSensor',
            // humSensor:      'toilet.humSensor',
            // fan:            'toilet.fan',
            
            door:           'wardrobe.door'
        }; 
        
        
        this.extRooms = [
        // корридор
        {
            door:           'wardrobe.door'
        }
        ];
        
        
        //this.settings = this.settings || {};
        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 10; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        
        // this.settings.fanStartDelay = 1.5;    // задержка включения вентилятора после включения света, мин
        // this.settings.fanMaxTimeout = 5;     // максимальная продолжинельность работы вентилятора после выключения света, мин
        
        this.init();
    }

    inherits(Wardrobe, AbstractRoom);

    Wardrobe.prototype.onExtRoomDoorEvent = function(extRoom, event) {
        //this.log('onDooonExtRoomDoorEventrEvent: ' + level);
        this[event.level == 'on' ? 'onExtRoomDoorOpen' : 'onExtRoomDoorClose'].call(this, extRoom);
        
        var doorsState = this.getExtRoomsDoorsState().summary.levelOnOff;
        if (doorsState == 'on')
            this.switchLight({mode:'on'});
        else
            this.switchLight({mode:'off'});
        
    };


  

    Wardrobe.prototype.init = function(){
        Wardrobe.super_.prototype.init.apply(this, arguments);
    };
    
    Wardrobe.prototype.stop = function(){
        Wardrobe.super_.prototype.stop.apply(this, arguments);
    };

    return new Wardrobe();
});

