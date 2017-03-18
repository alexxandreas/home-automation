(function(){


function initClass(superClass){

  function DeviceStorage() {
    DeviceStorage.super_.call(this, wrapper);
    // Call superconstructor first (ModuleBase)
    this.log('new DeviceStorage()');
    
  }
  
  inherits(DeviceStorage, superClass);
  DeviceStorage.prototype.initClass = initClass;
  
  DeviceStorage.prototype.init = function (config) {
    this.log('DeviceStorage.init');
    this.name = 'DeviceStorage';
    
//    this.settings = {
//      userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
//      intMotionTimeout: 60, // таймаут выключения света после окончания движения ВНУТРИ, мин
//      extMotionTimeout: 60, // таймаут выключения света после окончания движения СНАРУЖИ, мин
//      lightOffTimeout: 60, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
//      lastLightTimeout: 0, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
//      //nextRoom: 'Сorridor' // название соседней комнаты с общими устройствами
//    }
    
    
    //this.initHandlers();
    //this.targetsConfig = {
      //'220': {/*event: 'change:metrics:level', handler:this.handlers.on220LevelChanged*/}, // устройства, отвечающие за 220В свет
      //'ext220': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // устройства во внешних комнатах, 220В
      //'intMotion': {event: 'change:metrics:level', handler:this.onIntMChanged}, // датчики движения внутренние
      //'extMotion': {event: 'change:metrics:level', handler:this.onExtMChanged}, // датчики движения внешние
      //'buttonUp': {event: 'change:metrics:level', handler:this.onButtonUp}, // кнопка Вверх
      //'buttonDown': {event: 'change:metrics:level', handler:this.onButtonDown}, // кнопка Вниз
      //'lightSensor': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // датчик освещенности (для выбора 220/12)
      //'doors': {event: 'change:metrics:level', handler:this.onDoorChanged}
    //};
    
    var dict = {
      'hallway':  'прихожая',
      'corridor': 'коридор',
      'bathroom': 'ванная',
      'toilet':   'туалет',
      'kitchen':  'кухня',
      'wardrobe': 'гардеробная',
      'bedroom':  'спальня',
      'hall':     'холл',
      
      'light':    'свет',
      'L220':     ['220','основно'],
      'L12':      ['12','подсветка'],
      'sensor':   'датчик',
      'motion':   'движен',
      'temp':     'темпер',
      'hum':      'влажн',
      'fan':      ['вытяжка','вентилятор'],
      'door':     'двер',
      'tabletop': 'столешниц',
      'switch_':   'выключател',
      'center':   'центр',
      'edge':     'угл',
      'rgb':      'rgb'
    };
    
    this.deviceNames = {
      'hallway.switch220':      [dict.hallway, dict.light, dict.L220],      // FGD-211
      'hallway.light12':        [dict.hallway, dict.light, dict.L12],       // FGRGBWM-441  (x.2) (1110)
      'hallway.motionSensor':   [dict.hallway, dict.sensor, dict.motion],   // FGMS-001
      'hallway.lightSensor':    [dict.hallway, dict.sensor, dict.light],    // FGMS-001
      'hallway.tempSensor':     [dict.hallway, dict.sensor, dict.temp],     // FGMS-001
      
      'corridor.switch220':     [dict.corridor, dict.light, dict.L220],     // FGD-211
      'corridor.motionSensor':  [dict.corridor, dict.sensor, dict.motion],  // FGMS-001
      'corridor.lightSensor':   [dict.corridor, dict.sensor, dict.light],   // FGMS-001
      'corridor.tempSensor':    [dict.corridor, dict.sensor, dict.temp],    // FGMS-001
      
      'bathroom.switch220':     [dict.bathroom, dict.light, dict.L220],     // FGD-211
      'bathroom.motionSensor':  [dict.bathroom, dict.sensor, dict.motion],  // Aeon
      'bathroom.lightSensor':   [dict.bathroom, dict.sensor, dict.light],   // Aeon
      'bathroom.tempSensor':    [dict.bathroom, dict.sensor, dict.temp],    // Aeon
      'bathroom.humSensor':     [dict.bathroom, dict.sensor, dict.hum],     // Aeon
      'bathroom.door':          [dict.bathroom, dict.door],                 // FGRGBWM-441  (x.2) (1110)
      
      'toilet.switch220':       [dict.toilet, dict.light, dict.L220],       // FGD-211
      'toilet.light12':         [dict.toilet, dict.light, dict.L12],        // FGRGBWM-441  (x.5) (1110)
      'toilet.motionSensor':    [dict.toilet, dict.sensor, dict.motion],    // Aeon
      'toilet.lightSensor':     [dict.toilet, dict.sensor, dict.light],     // Aeon
      'toilet.tempSensor':      [dict.toilet, dict.sensor, dict.temp],      // Aeon
      'toilet.humSensor':       [dict.toilet, dict.sensor, dict.hum],       // Aeon
      'toilet.fan':             [dict.toilet, dict.fan],                    // 
      'toilet.door':            [dict.toilet, dict.door],                   // FGRGBWM-441  (x.3) (1110)
       
      'kitchen.switch220':      [dict.kitchen, dict.light, dict.L220],      // FGD-211
      'kitchen.light12':        [dict.kitchen, dict.light, dict.L12],       // FGRGBWM-441  (x.2) (1110)
      'kitchen.motionSensor':   [dict.kitchen, dict.sensor, dict.motion],   // FGMS-001
      'kitchen.lightSensor':    [dict.kitchen, dict.sensor, dict.light],    // FGMS-001
      'kitchen.tempSensor':     [dict.kitchen, dict.sensor, dict.temp],     // FGMS-001
      'kitchen.tabletopLight':  [dict.kitchen, dict.light, dict.tabletop],  // FGRGBWM-441  (x.5)
      'kitchen.tabletopSwitch': [dict.kitchen, dict.switch_, dict.tabletop],// FGRGBWM-441  (x.3) (0001)
      
      'wardrobe.switch220':     [dict.wardrobe, dict.light],                // 
      'wardrobe.door':          [dict.wardrobe, dict.door],                 // FGRGBWM-441  (x.4)
      
      'bedroom.switch220center':[dict.bedroom, dict.light, dict.center],    // FGD-211
      'bedroom.switch220edge':  [dict.bedroom, dict.light, dict.edge],      // FGD-211
      'bedroom.rgb':            [dict.bedroom, dict.light, dict.rgb],       // FGRGBWM-441 (switchRGBW) (1110 1110 1110)
      'bedroom.w':              [dict.bedroom, dict.light, dict.L12],       // FGRGBWM-441 (x.5) (1110)
      
      'hall.switch220center':   [dict.hall, dict.light, dict.center],       // FGD-211
      'hall.switch220edge':     [dict.hall, dict.light, dict.edge],         // FGD-211
      'hall.rgb':               [dict.hall, dict.light, dict.rgb],          // FGRGBWM-441 (switchRGBW) (1110 1110 1110)
      'hall.w':                 [dict.hall, dict.light, dict.L12]           // FGRGBWM-441 (x.5) (1110)
    };
    
    this.devices = {};
   
    // Call superclass
    DeviceStorage.super_.prototype.init.call(this);
    
    // получаем все перечисленные устройства
    this.initDevices();
    
    // получаем сцены для фибаровских выключателей
    [ 'hallway.switch220',
      'corridor.switch220',
      'bathroom.switch220',
      'toilet.switch220',
      'kitchen.switch220',
      'bedroom.switch220center',
      'bedroom.switch220edge',
      'hall.switch220center',
      'hall.switch220edge'
    ].forEach(function(key){
      this.getFGD211Scenes(key);
    }, this);
      
    
    var self = this;
    
    this.api = {
      get: self.getDevice.bind(self) // возвращает vDev по ключу
      
    }
  };
  
  DeviceStorage.prototype.destroy = function(){
    DeviceStorage.super_.prototype.destroy.call(this);
  };
  
  
  DeviceStorage.prototype.initDevices = function(){
    Object.keys(this.deviceNames).forEach(function(key){
      var vDevs = this.getDevicesByName(this.deviceNames[key]);
      if (vDevs.length == 0){
        this.log('Error: initDevices(' + key + '): не найдено ни одного устройства');
        //return null;
      } else if (vDevs.length > 1){
        var text = vDevs.map(function(vDev){
          return vDev.id + '(' + vDev.get('metrics:title') + ')'
        }).join(', ');
        this.log('Error: initDevices(' + key + '): найдено ' + vDevs.length + 'шт: ' + text);
        //return null;
      }
      this.devices[key] = vDevs[0];
      //return vDevs[0];
    }, this);
  };
  
  DeviceStorage.prototype.getDevice = function(key){
    if (this.devices[key])
      return this.devices[key];
//    if (!this.deviceNames[key]){
//      this.log('Error: getDevice(' + key + '): устройства с таким ключем не определены');
//    }
    return null;
  };
  
  /* Поиск vDev по заданному названию
  parts = [part,part,...] 
  parts = [part, [subPart, subPart, ...] ,...]
  part - строки, объединяются условием И
  subPart - строки, объединяются условием ИЛИ
  поиск регистронезависимый
  ex: (['Кухня','свет'])
  ex: ([['Кухня','Kitchen'],['свет','light']])
  возвращает массив подходящих vDev
  */
  DeviceStorage.prototype.getDevicesByName = function(parts){
    var devices=[];
    controller.devices.forEach(function(vDev){
      var devName = vDev.get('metrics:title') || '';
      devName = devName.toLowerCase();
      if (parts.every(function(part){
      if (part instanceof Array){
          return part.some(function(subPart){
              return devName.indexOf(subPart.toLowerCase()) >= 0;
          });
        } else {
          return devName.indexOf(part.toLowerCase()) >= 0;
      }
      })){ devices.push(vDev); }
    });
    return devices;
  }
  
  
  
  DeviceStorage.prototype.getVDev = function(id){
    var vDev = this.controller.devices.get(id);
    return vDev;
  };

  // получение устройств-сцен для выключателей Fibaro FGD211
  DeviceStorage.prototype.getFGD211Scenes = function(key){
    var vDev = this.getDevice(key);
    if (!vDev) return;
    
    //var scenes = [];
    var realId = this.getRealId(vDev.id);
    if (realId == null) return;
    
    var conf = {
         10: "Switch from off to on",
         11: "Switch from on to off",
         //12: "S1 holding down",
         13: "S1/S2 releasing",
         14: "S1 double click",
         //15: "S1 triple click",
         //16: "S1 single click",
         17: "S1 Brighten",
         18: "S2 Dim"
         //22: "S2 holding down",
         //23: "S2 releasing",
         //24: "S2 double click",
         //25: "S2 triple click",
         //26: "S2 single click"
    };
    Object.keys(conf).forEach(function(num){
        var sceneId = "ZWayVDev_zway_Remote_" + realId + "-0-0-" + num + "-S";
        var vDev = this.getVDev(sceneId);
        if (!vDev){
          //this.log('Error: getFGD211Scenes(' + key + '): сцена ' + sceneId + ' не найдена');
          this.log('Error: сцена "' + conf[num] + '" (' + num + ') для ' + key + ' не найдена');
        } else {
          this.devices[key + '_' + sceneId] = vDev;
        }
    }, this);
    
  }
  
  /** Получение id физического устройства */
  DeviceStorage.prototype.getRealId = function(vDevId){
    //var id = vDev.id;
    var id = vDevId;
    var res = id.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
    if (res.length >= 2) return res[1];
    return null;
  }
  
 
  
  return new DeviceStorage();
}


(function waitSuperClass(){
  var superClass = wrapper.myZWay.ModuleBase;
  if (superClass) {
    wrapper.log('waitSuperClass: superClass found! initClass()');
    initClass(superClass);
  }
  else {
    wrapper.log('waitSuperClass: superClass not found. waiting...');
    setTimeout(waitSuperClass, 10*1000);
  }
})()


})()


