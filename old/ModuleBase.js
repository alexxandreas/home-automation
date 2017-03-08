(function(){

// Class Constructor -> SuperClass Constructor -> SuperClass deferredInit -> Class Init -> SuperClass Init
function ModuleBase(wrapper) {
    //this.initClass = initClass;
    
    Object.keys(wrapper.exports).forEach(function(key){
      this[key] = wrapper.exports[key];
    }, this);
    
    this.restartOnModuleBaseRefresh = true;
   
    this.timers = {};
    this.actions = {};

    this.config = {
      waitInitTimeout: 10 // ждать инициализации Z-Way и еще 10 секунд после
    };
    
    // конфиг для функции выбора подходящего освещения (220 или 12)
    this.suitableLightConfig = {
      dayInterval: {hStart:6, mStart:0, hEnd:22, mEnd:0}, // интервал времени, в который гарантированно будет включаться 220 свет. 
      minIlluminationLevel: 0, // уровень освещенности, Lux, выше которого будет гарантированно включаться 220 свет (если не попали в dayInterval).
      lightSensorTarget: 'lightSensor', // устройство, отвечающее за датчик освещенности
      ext220Targets: 'ext220', // устройства, отвечающие за внешний 220В свет. Если он включен - включится 220, иначе 12
      int12Targets: '12' // устройства, отвечающие за 12В свет в текущем помещении. Если таких нет - вернется 220
    };
    
    /*this.suitableLightConfig = {
      dayInterval: {hStart:8, mStart:0, hEnd:20, mEnd:0}, // интервал времени, в который гарантированно будет включаться 220 свет. 
      minIlluminationLevel: 0, // уровень освещенности, Lux, выше которого будет гарантированно включаться 220 свет (если не попали в dayInterval).
      //lightSensorTarget: 'lightSensor', // устройство, отвечающее за датчик освещенности
      //ext220Targets: 'ext220', // устройства, отвечающие за внешний 220В свет. Если он включен - включится 220, иначе 12
      //int12Targets: 'int12' // устройства, отвечающие за 12В свет в текущем помещении. Если таких нет - вернется 220
    }*/
    
    this.settings = {};
    
    this.state = {};
    
    this.name = null;
    
    
    
    this.targetsConfig = {
    // конфиг для подписки на события изменения данных в формате
    // название_группы: {event: 'тип события', handler:обработчик}
    // обработчик вызывается с неизвестным this, поэтому в нем необходимо использовать self. 
    // обработчик должен быть определен в функции initHandlers
    // пример:
    // 'intMotion': {event: 'change:metrics:level', handler:this.handlers.intMChanged}, // датчики движения внутренние
    };
   
    //if (wrapper.myZWay.started) {
//    if (!!global.ZAutomation){
//      this.deferredInit();
//    } else {
//      //wrapper.myZWay.startCallbacks.push({fn: this.deferredInit, scope: this});
//      var self = this;
//      var fn = function(){
//        //wrapper.controller.off('core.start', fn); 
//        self.deferredInit.call(self);
//      }
//      //wrapper.controller.on('core.start', fn); 
//      this.controller.on('core.start', fn); 
//    }
    this.deferredInit();
    
    wrapper.module = this;
   
    
};

wrapper.myZWay.ModuleBase = ModuleBase;

ModuleBase.prototype.deferredInit = function(){
  //var self = this;
  var initFn = init.bind(this);
  
  if (!!global.ZAutomation){
    //init.call(self);
    initFn();
  } else {
    //var self = this;
    //var fn = function(){
    //  init.call(self);
    //} 
    this.controller.on('core.start', initFn); 
  }
  
  function init(){
    if (this.config.waitInitTimeout){
    setTimeout(function () { 
      this.init.call(self); 
      }, this.config.waitInitTimeout*1000
    );
   } else {
     self.init.call(self);
   }
  }
 
}


//ModuleBase.prototype.deferredInit = function(){
//  var self = this;
//  if (this.config.waitInitTimeout){
//    setTimeout(function () { 
//      self.init.call(self); 
//      }, this.config.waitInitTimeout*1000
//    );
//   } else {
//     this.init();
//   }
//}

ModuleBase.prototype.init = function () {
  this.log('ModuleBase.init');
  
  this.state = {
    intM: 'off', // движение внутри ('on', 'off')
    intMTimeout: 0, // Date.now(); - время изменения значения движения внутри
    extM: 'off', // движение снаружи ('on', 'off')
    light: null, // свет (null, '12', '220')
    userMode: null, // режим работы (null, '12', '220', 'on', 'off')
    // Если движение снаружи началось после окончания движения внутри - 
    // значит снаружи другой человек. Не реагируем на внешний датчик движения
    extMotions: {}, // id_внешнего_датчика_движения -> {value: ('on'/'off'), ignore: (true/false), changeTime: Date.now()}
    doors: {}, // id_двери -> {value: ('on'/'off'), changeTime: Date.now()}
    someDoorOpened: false, // хотя бы одна дверь открыта
    someDoorClosed: false, // хотя бы одна дверь закрыта
    lastLight: null, // последний включенный свет. Восстанавливается, если между выключениями был небольшой интервал
    fanMode: 'off', // состояние вентилятора (для ванной и туалета) ('on', 'off')
    fanModeTimeout: 0 //  Date.now(); - время изменения значения fanMode
  };
    
  var tg = this.targetsConfig;
  //this.log('ModuleBase.init ' + JSON.stringify(tg));
  this._handlers = [];
  var self = this;
  
  this.initActions();
  
  Object.keys(tg).forEach(function(key){
    var conf = tg[key];
    //this.log('ModuleBase.init ' + key);
    if (conf.handler){
      //this.log('ModuleBase.init ' + key + ' handler');
      this.getTargets(key).forEach(function(id){
        //this.log('watch ' + key + ' (' + dev.id + ') on ' + conf.event);
        var handler = {
          key: key,
          id: id, 
          event: conf.event,
          fn: function(){ 
            try { // оборачиваем подписчики в try/catch, чтобы в случае ошибки не ломались другие модули
              //var startTime = Date.now();
              conf.handler.call(self, id);
              //var deltaTime = Date.now() - startTime;
              //self.log('Handler profiler: ' + deltaTime + 'ms: '+handler.key + ' (' + handler.id + ') on ' + handler.event);
            } catch(err){
              self.log('Error in handler: '+ handler.key + ' (' + handler.id + ') on ' + handler.event + ' ' + err.toString() + ' ' + err.stack);
            } 
          }
        };
        this.log('watch ' + handler.key + ' (' + handler.id + ') on ' + handler.event);
        this._handlers.push(handler);
        //this.controller.devices.on(dev.id, conf.event, conf.handler);
        this.controller.devices.on(handler.id, handler.event, handler.fn);
      }, this);
    }
  }, this);
   
  if (this.name) {
    this.myZWay.modules[this.name] = this;
  }
  
  this.api = {
    getCurrentLight: function(){
      return self.state.light;
    },
    getUserMode: function(){
      return self.state.userMode;
    },
    getMotionState: function(){
      return {
        state: self.state.intM,
        timeout: self.state.intMTimeout > 0 ? Date.now() - self.state.intMTimeout : 0 // время с момента изменения состояния, мс
      }
    },
    getTimerState: function(timerId) {
      var timer = self.timers[timerId];
      if (!timer || !timer.timer) return {state:'off', timeout:0}
      return {
        state: 'on',
        timeout: timer.offTime - Date.now() // оставшееся время в мс
      }
    },
    switchLight: self.switchLight.bind(self),
    getFanMode: function(){ return self.state.fanMode; }
  };
  
  
  
};

// приведение системы в исходное состояние
ModuleBase.prototype.initActions = function(){
  this.getTargets('12').forEach(function(id) {
    var vDev = this.getVDev(id);
    vDev && vDev.performCommand('off');
  }, this);
  this.getTargets('220').forEach(function(id) {
    var vDev = this.getVDev(id);
    vDev && vDev.performCommand('off');
  }, this);
}


ModuleBase.prototype.destroy = function () {
    this.log('moduleBase.destroy');
    
    //var self = this;
    Object.keys(this.timers).forEach(function(name){
      this.stopTimer(name);
    }, this);
    
    Object.keys(this.actions).forEach(function(name){
      this.action(name);
    }, this);
    
   
    this._handlers.forEach(function(handler){
      this.log('unwatch ' + handler.key + ' (' + handler.id + ') on ' + handler.event);
      this.controller.devices.off(handler.id, handler.event, handler.fn);
    }, this);

};


ModuleBase.prototype.getVDev = function(id){
  var vDev = this.controller.devices.get(id);
  //this.log('getVDev(' + id + '): ' + (vDev ? 'OK' : 'not found!'));
  //return this.controller.devices.get(id);
  return vDev;
};

ModuleBase.prototype.getNextRoom = function(){
  if (!this.settings.nextRoom) return null;
  return this.myZWay.modules[this.settings.nextRoom];
};






// подбор подходящего по обстоятельствам света (основной 220, или подсветка 12)
ModuleBase.prototype.getSuitableLight = function(){
  
  var conf = this.suitableLightConfig;
  if (conf.dayInterval){
    // Если сейчас день (с 8 до 21) - вернуть '220'. [08:00 22:00]
    var dayInterval = [formatTime(conf.dayInterval.hStart, conf.dayInterval.mStart), formatTime(conf.dayInterval.hEnd, conf.dayInterval.mEnd)];
    var date = new Date();
    var now = formatTime(date.getHours(), date.getMinutes());
    if (dayInterval[0] <= now && dayInterval[1] >= now){
      this.log('getSuitableLight: 220 (время = ' + now + ' попало в дневной интервал [' + dayInterval[0] + ', ' + dayInterval[1] + '])');
      return '220';
    }
  }
  
  if ((conf.minIlluminationLevel || conf.minIlluminationLevel === 0) && conf.lightSensorTarget){
    // Если уровень освещенности в помещении больше 10 Lux - вернуть 220.
    var lightSensorId = this.getTarget(conf.lightSensorTarget);
    var lightSensor = lightSensorId && this.getVDev(lightSensorId);
    if (lightSensor){
      var illuminationLevel = lightSensor.get("metrics:level");
      if (conf.minIlluminationLevel < illuminationLevel){
        this.log('getSuitableLight: 220 (уровень освещености = ' +illuminationLevel+ ', минимальный для 220 = ' + conf.minIlluminationLevel + ')');
        return '220';
      }
    }
  }
  
  // Если хотя бы в одной соседней комнате горит '220' - вернуть '220'.
  if (conf.ext220Targets) {
    if (!this.getTargets(conf.ext220Targets).length || this.getTargets(conf.ext220Targets).some(function(id){
      var vDev = this.getVDev(id);
      return vDev && vDev.get("metrics:level") > 0;
    }, this)) {
      this.log('getSuitableLight: 220 (внешний 220 свет включен)');
      return '220';
    }
    /*if (!this.getTargets(conf.ext220Targets).length || this.getTargets(conf.ext220Targets).some(function(dev){
      return dev.vDev && dev.vDev.get("metrics:level") > 0;
    })) {
      this.log('getSuitableLight: 220 (внешний 220 свет включен)');
      return '220';
    }*/
  }
  
  // если есть 12В устройства - то 12В
  /*if (conf.int12Targets){
    if (this.getTargets(conf.int12Targets).length && this.getTargets(conf.int12Targets).some(function(dev){
      return !!dev.vDev;
    })) {
      this.log('getSuitableLight: 12');
      return '12';
    }
  }*/
  if (this.is12TargetsExists()){
    this.log('getSuitableLight: 12');
    return '12';
  }
  
  this.log('getSuitableLight: 220 (12В устройства не найдены)');
  return '220';
  
  function formatTime(h,m){
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }
};

ModuleBase.prototype.is12TargetsExists = function(){
  var conf = this.suitableLightConfig;
  return conf.int12Targets && this.getTargets(conf.int12Targets).length && this.getTargets(conf.int12Targets).some(function(id){
      return !!this.getVDev(id);
      //return !!dev.vDev;
    }, this);
};


// запуск таймера. 
// name - уникальное название
// sec - время в секундах
// callback - функция обратного вызова
// continue - если true и такой таймер уже запущен - запускается таймер с наименьшим оставшимся временем
 ModuleBase.prototype.startTimer = function(name, sec, callback, _continue){
  var oldTimer = this.timers[name];
  oldTimer && oldTimer.timer && clearTimeout(oldTimer.timer);
  if (oldTimer && oldTimer.offTime && _continue){
    var timeout = Math.min(sec * 1000, oldTimer.offTime - Date.now());
  } else {
    var timeout = sec * 1000;
  }
  
  var self = this;
  this.timers[name] = {
    offTime: Date.now() + timeout,
    timer: setTimeout(function(){
      // иногда после stopTimer все равно вызывается callback (если время до вызова меньше секунды)
      if (!self.timers[name]) return; 
      delete self.timers[name];
      callback.call(self);
    }, timeout)
  };
 
  this.log('startTimer(' + name + ', ' + sec + ') -> timeout=' + timeout/1000);
};

ModuleBase.prototype.stopTimer = function(name){
  var oldTimer = this.timers[name];
  if (!oldTimer) return;
  oldTimer.timer && clearTimeout(oldTimer.timer);
  delete this.timers[name];
  this.log('stopTimer(' + name + ')');
};




ModuleBase.prototype.onIntMChanged = function (id){ // внутреннее движение началось или завершилось
   
    // обновляем общее состояние внутренних датчиков движения
    var motion = (this.getTargets('intMotion').some(function(id){
	  var vDev = this.getVDev(id);
      return vDev && vDev.get("metrics:level") == 'on';
      //return dev.vDev && dev.vDev.get("metrics:level") == 'on';
	},this) ? 'on' : 'off');
    
    if (motion == this.state.intM) return;
    this.state.intM = motion;
    this.state.intMTimeout = Date.now();
    
	this[motion == 'on' ? 'onIntMOn' : 'onIntMOff'].call(this);
  };
  
  ModuleBase.prototype.onIntMOn = function(){ // начало движения внутри
	this.log('onIntMOn: начало движения внутри. userMode='+ this.state.userMode);
	this.stopTimer('offTimer');

    Object.keys(this.state.extMotions).forEach(function(id){
       this.state.extMotions[id].ignore = false;
    },this);
	//setOffTimer(null); // сбрасываем таймер
	if (this.state.userMode != 'off' && !this.state.light)
	  this.switchLight({mode:'on'});
  };
  
  ModuleBase.prototype.onIntMOff = function(){ // конец движения внутри
	this.log('onIntMOff: конец движения внутри. userMode='+ this.state.userMode);
	//if (this.state.userMode != 'on' && this.state.userMode != 'off') { // таймер взводим только если режим не on и не off
	if (this.state.userMode == 'on' || !this.state.light) return; // таймер взводим только если режим не on и свет горит
    
    var timeouts = [];
    
    // рассчитываем таймаут по внешним датчикам движения
    if (this.state.extM == 'on')
        timeouts.push((this.settings.intMotionTimeout + this.settings.extMotionTimeout)*60/2);
    else {
      // считаем, как давно закончилось движение снаружи
      var min = Number.MAX_VALUE;
      Object.keys(this.state.extMotions).forEach(function(key){
        var val = (this.state.extMotions[key].changeTime ? Date.now() - this.state.extMotions[key].changeTime : Number.MAX_VALUE);
        min = Math.min(min, val);
      },this);
      if (min < 5*1000){ // движение снаружи закончилось меньше, чем 5 секунд назад
        this.log('onIntMOff: движение снаружи закончилось меньше, чем 5 секунд назад');
        timeouts.push(this.settings.extMotionTimeout*60);
      } else {
        timeouts.push(this.settings.intMotionTimeout*60);
      }
    }
    
    // рассчитываем таймаут по закрывшимся дверям
    // считаем, как давно закрылась последняя дверь
    var min = Number.MAX_VALUE;
    Object.keys(this.state.doors).forEach(function(key){
      var val = (this.state.doors[key].value == 'on' && this.state.doors[key].changeTime ? Date.now() - this.state.doors[key].changeTime : Number.MAX_VALUE);
      min = Math.min(min, val);
    },this);
    if (min < 20*1000){ // послденяя двень закрылась меньше, чем 15+5 секунд назад
      this.log('onIntMOff: послденяя двень закрылась меньше, чем 15+5 секунд назад');
      timeouts.push(this.settings.extMotionTimeout*60);
    } // если последняя дверь закрылась позже, чем через 20 секунд - не учитываем двери
    
    var timeout = Math.min.apply(Math, timeouts);
    
    this.startTimer('offTimer', 
                    timeout,
                    this.onOffTimer, 
                    true);
	
  };
  
  
  ModuleBase.prototype.onExtMChanged = function (id){  // внешнее движение началось или завершилось
	//this.log('onExtMChanged (' + id + ')');
    /*var val = (this.getTargets('extMotion').some(function(dev){
	  return dev.vDev && dev.vDev.get("metrics:level") == 'on';
	}) ? 'on' : 'off');*/
	
    // обновляем общее состояние внешних датчиков движения
    var motion = (this.getTargets('extMotion').some(function(id){
	  var vDev = this.getVDev(id);
      return vDev && vDev.get("metrics:level") == 'on';
      //return dev.vDev && dev.vDev.get("metrics:level") == 'on';
	},this) ? 'on' : 'off');
    
    this.state.extM = motion;
    
    var vDev = this.getVDev(id);
    if (!vDev) {
      //this.log('onExtMChanged (' + id + '): device not found');
      return;
    }
    var value = vDev.get("metrics:level") == 'on' ? 'on' : 'off';
    
    if (this.state.extMotions[id] && this.state.extMotions[id].value == value) { //значение не изменилось
      return;
    }
   
    this.state.extMotions[id] = this.state.extMotions[id] || {ignore:false};
    this.state.extMotions[id].value = value;
    this.state.extMotions[id].changeTime = Date.now()
    
    this[value == 'on' ? 'onExtMOn' : 'onExtMOff'].call(this, id); 
    
  };
  
  ModuleBase.prototype.onExtMOn = function(id){ // начало движения снаружи
    //this.state.extMotions[id].ignore = (this.state.intM == 'off' && !!this.state.light);
    if (!this.state.light){
      this.state.extMotions[id].ignore = false;
      this.log('onExtMOn: userMode='+ this.state.userMode + ' ignoreExtMotion['+id+']=>' + this.state.extMotions[id].ignore + ' (свет выключен)');
    } else if (this.state.intM == 'on'){
      this.state.extMotions[id].ignore = false;
      this.log('onExtMOn: userMode='+ this.state.userMode + ' ignoreExtMotion['+id+']=>' + this.state.extMotions[id].ignore + ' (есть движение внутри)');
    } else if (this.state.intMTimeout && Date.now() - this.state.intMTimeout < 5*1000){
      this.state.extMotions[id].ignore = false;
      this.log('onExtMOn: userMode='+ this.state.userMode + ' ignoreExtMotion['+id+']=>' + this.state.extMotions[id].ignore + ' (с конца движения внутри прошло < 5 сек.)');
    } else {
      this.state.extMotions[id].ignore = true;
      this.log('onExtMOn: userMode='+ this.state.userMode + ' ignoreExtMotion['+id+']=>' + this.state.extMotions[id].ignore + ' (с конца движения внутри прошло > 5 сек.)');
    }
  };
  
  ModuleBase.prototype.onExtMOff = function(id){ // конец движения снаружи
	this.log('onExtMOff: конец движения снаружи. userMode='+ this.state.userMode + ' ignoreExtMotion['+id+']==' + this.state.extMotions[id].ignore);
	if (this.state.extMotions[id].ignore) return;
	if (this.state.intM == 'on') return;
	//if (this.state.userMode != 'on' && this.state.userMode != 'off') { // таймер взводим только если режим не on и не off
	if (this.state.userMode != 'on' && this.state.light) { // таймер взводим только если режим не on и не off
	  this.startTimer('offTimer', 
		this.settings.extMotionTimeout*60, 
        //(Date.now() - this.state.intMTimeout < 3000) ? this.settings.extMotionTimeout*60 : this.settings.intMotionTimeout*60,
        //this.settings.intMotionTimeout*60,
		this.onOffTimer,
		true);
       // если движение сранужи закончилось меньше чем через 3 секунды после окончания движения внутри - значит кто-то ушел из комнаты
       
	}
  };
  
  ModuleBase.prototype.onOffTimer = function(){ // сработал таймер отключения света
	this.log('onOffTimer: Отключение света по таймеру. userMode='+ this.state.userMode);
	this.stopTimer('offTimer');
	//setOffTimer(null); // сбрасываем таймер
	if (this.state.userMode != 'on')
	  this.switchLight({mode:'off'});
  };
  
  ModuleBase.prototype.onUserModeTimer = function(){ // сработал таймер сброса пользовательского режима
	this.log('onUserModeTimer: Сброс userMode по таймеру: ' + this.state.userMode + '=>null');
	//if (this.state.userMode == 'on' && this.state.light){
    if (this.state.light){
	  this.switchLight({mode:'off'});
	}
	this.state.userMode = null;
  };
  
  ModuleBase.prototype.onLastLightTimer = function(){ // сработал таймер сброса пользовательского режима
	this.log('onLastLightTimer: Сброс lastLight по таймеру: ' + this.state.lastLight + '=>null');
	this.state.lastLight = null;
  };
  
  ModuleBase.prototype.onButtonUp = function(){ // кликнута кнопка Вверх
	if (!this.state.light){
	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>220');
	  this.state.userMode = '220';
	  this.switchLight({mode:'on', force:true, light:'220'});
	} else if (this.state.light == '12'){
	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>220');
	  this.state.userMode = '220';
	  this.switchLight({mode:'on', force:true, light:'220'});
	} else if (this.state.light == '220'){
	  this.log('onButtonUp: кликнута кнопка Вверх. userMode=>on');
	  this.state.userMode = 'on';
	}
  };
  
  ModuleBase.prototype.onButtonDown = function(){ // кликнута кнопка Вниз
	if (!this.state.light){
	  this.log('onButtonDown: кликнута кнопка Вниз. userMode=>off');
	  this.state.userMode = 'off';
	} else if (this.state.light == '12'){
	  this.log('onButtonDown: кликнута кнопка Вниз. userMode=>off');
	  this.state.userMode = 'off';
	  this.switchLight({mode:'off', force:true});
	} else if (this.state.light == '220'){
      if (this.is12TargetsExists()){
        this.log('onButtonDown: кликнута кнопка Вниз. userMode=>12');
        this.state.userMode = '12';
        this.switchLight({mode:'on', force:true, light:'12'});
      } else {
        this.log('onButtonDown: кликнута кнопка Вниз. 12В устройства не найдены. userMode=>off');
        this.state.userMode = 'off';
        this.switchLight({mode:'off', force:true});
      }
	  
	}
  };
  
  ModuleBase.prototype.onLightOn = function(light){ // свет включен каким-то образом извне. light == '12' || '220'
	return;
	this.log('onLightOn: ' + light + ' включён извне. userMode=>on');
	this.state.light = light;
	this.state.lastLight = light;
	this.state.userMode = 'on';
	//this.switchLight('on');
	if (this.state.intM != 'on')
	  this.startTimer('userMode', this.settings.userModeTimeout*60, this.onUserModeTimer);
  };
  
  ModuleBase.prototype.onLightOff = function(light){ // свет выключен каким-то образом извне. light == '12' || '220'  
	return;
	if (this.state.userMode == light || this.state.userMode == 'on'){
	  this.state.userMode = null;
	  this.stopTimer('userMode');
	}
	this.log('onLightOff: ' + light + ' выключен извне. userMode=>' + this.state.userMode);
	if (this.state.light == light)
	  this.switchLight({mode:'off'});
  };
  
  
  // mode = 'on', 'off'
  //ModuleBase.prototype.switchLight = function(mode){
  // options.mode: 'on', 'off'
  // options.force: true/false - принудительное включение/выключение 
  // options.light: null, '12', '220' - режим света. если не указан - автовыбор
  ModuleBase.prototype.switchLight = function(options){
     
      if (options.mode == 'on'){ // включить
        
          // если указали конкретный свет - включаем его
          if (options.light == '12' || options.light == '220'){         
            var light = options.light;
          } 
          // если в соседней комнате горит 12 - тоже включаем 12
          else if (this.getNextRoom() && this.getNextRoom().api.getCurrentLight() == '12'){
            var light = '12';
          }
          // учитываем userMode
          else if (this.state.userMode == '220' || this.state.userMode == '12'){
            var light = this.state.userMode;
          } 
          // учитываем последний включенный свет
          else if (this.state.lastLight) {
            var light =this.state.lastLight;
          } 
          // определяем подходящий свет
          else {      
            var light = this.getSuitableLight();
          }
          //this.log('switchLight: this.state.light = ' + this.state.light + ', light = ' + light);
          if (this.state.light != light){ // если такой свет еще не включен
              turn.call(this, light, 'on');
              this.state.lastLight = light;
              if (this.state.light){ // если включен другой свет
                  turn.call(this, this.state.light,'off');
                  this.state.light = light;
              } else {
                  this.state.light = light;
                  this.onLightOn.call(this); 
              }
          }
          
          if (this.state.intM == 'off'){
            // если движения внутри нет - ставим таймер отключения, чтобы свет выключился в любом случае
            this.startTimer('offTimer', 
              this.settings.lightOffTimeout*60,
              this.onOffTimer,
              true);
          }
          this.stopTimer('userMode');
          this.stopTimer('clearLastLight');
          
         
          
      } else { // выключить
          if (this.state.light) { // если включен свет
              //turn.call(this, this.state.light,'off');
              if (this.state.light == '12' && this.getNextRoom() && this.getNextRoom().api.getCurrentLight() == '12'){
                // попытка выключить 12, когда в смежной комнате тоже горит 12. Не выключаем, просто сбрасываем state.light
                if (options.force){
                  this.getNextRoom().api.switchLight({light:'12',mode:'off'});
                  turn.call(this, this.state.light,'off');
                }
              } else {
                turn.call(this, this.state.light,'off');
              }
              this.state.light = null;
              this.onLightOff.call(this); 
          }
          
          if (this.state.userMode) // таймер сброса запускаем только когда свет потух
            this.startTimer('userMode', this.settings.userModeTimeout*60, this.onUserModeTimer);
          if (this.state.lastLight)
            this.startTimer('clearLastLight', this.settings.lastLightTimeout*60, this.onLastLightTimer);
      }
   
      // light = '220', '12'
      // mode = 'on', 'off'
      function turn(light, mode){
        this.log('turnLight(' + light + ', ' + mode + ')');
        this.getTargets(light).forEach(function(id) {
          var vDev = this.getVDev(id);
          //this.log('turnLight(' + light + ', ' + mode + '): ' + id + (vDev ? ' => ' + mode ? ' not found!');
          //vDev && vDev.performCommand(mode);
          if (vDev){
            //vDev.performCommand(mode);
            this.action('switchLight '+light+' ('+id+')', function(){
              vDev.performCommand(mode);
            }, function(){
              if (mode == 'on')
                return vDev.get("metrics:level") > 0;
              else 
                return vDev.get("metrics:level") == 0;
            });
          }
        }, this);
      }
      
      
  };
  
  
  ModuleBase.prototype.switchFan = function(mode){
     
     if (this.state.fanMode == mode)
       return;
     
     if (mode == 'on'){ // включить
   
        turn.call(this, 'on');
          
          /*if (this.state.intM == 'off'){
            // если движения внутри нет - ставим таймер отключения, чтобы свет выключился в любом случае
            this.startTimer('offTimer', 
              this.settings.lightOffTimeout*60,
              this.onOffTimer,
              true);
          }*/
              
      } else { // выключить
          if (this.state.fanMode == 'on') { // если включен свет
              //turn.call(this, this.state.light,'off');
              if (this.getNextRoom() && this.getNextRoom().api.getFanMode() == 'on'){
                // попытка выключить 12, когда в смежной комнате тоже горит 12. Не выключаем, просто сбрасываем state.light
                /*if (options.force){
                  this.getNextRoom().api.switchLight({light:'12',mode:'off'});
                  turn.call(this, this.state.light,'off');
                }*/
              } else {
                turn.call(this, 'off');
              }
          }
          
      }
      
      this.state.fanMode = mode;
      this.state.fanModeTimeout = Date.now();
   
      // light = '220', '12'
      // mode = 'on', 'off'
      function turn(mode){
        this.log('turnFan(' + mode + ')');
        this.getTargets('fan').forEach(function(id) {
          var vDev = this.getVDev(id);
          if (vDev){
            //vDev.performCommand(mode);
            this.action('switchFan ('+id+')', function(){
              vDev.performCommand(mode);
            }, function(){
              return vDev.get("metrics:level") == mode;
            });
          }
        }, this);
      }
      
      
  };
  
  
  
  // Helper для выполнения команд. 
  // action - функция, выполняющая команду
  // check - функция проверки. Возвращаемые значения: true, false
  // Если проверка не пройдена - выполняется повторный запуск
  // action через таймауты
  /*ModuleBase.prototype.performCommand = function(action, check, title){
    var self = this;
    var maxRestartCount = 20; // кол-во вызовов run. на maxRestartCount+1 вызов - ошибка
    run(0);
    
    function run(counter){
      self.log(title + (counter > 0 ? ' RESTART ' + counter : ''));
      action.call(self);
      
      setTimeout(function () { 
          if (check.call(self)) {// проверка прошла успешно
            self.log(title + ' OK');
            return; 
          }
          counter++;
          if (counter > maxRestartCount){
            self.log(title + ' ERROR');
            return;
          }
          run(counter);
        }, 
        //(counter+1)*1000 // 1s, 2s, 3s, 4s, 5s
        1000
      );
    }
    
  };*/
  
  ModuleBase.prototype.action = function(name, action, check, count){
	//this.log('action: ' + name);
	var oldAction = this.actions[name];
	// останавливаем предыдущее
	oldAction && oldAction.timer && clearTimeout(oldAction.timer);

	if (!(action instanceof Function)){ // stop
		this.log(name + ' STOP');
		delete this.actions[name];
		return;
	}
	
    this.actions[name] = {
      startTime: Date.now()
    };
	var self = this;
    //var maxRestartCount = count || 60; // кол-во вызовов run. на maxRestartCount+1 вызов - ошибка
    run();
	
	function run(){
	  if (!self.actions[name]) return;
      var seconds = Math.floor((Date.now() - self.actions[name].startTime)/1000);
      
      self.log(name + (seconds > 0 ? ' +' + seconds + ' sec' : ''));
      action.call(self);
      
      var timeout = (Math.floor(seconds / 15)+1)*1000;
      
      self.actions[name].timer = setTimeout(function () { 
          if (check.call(self)) {// проверка прошла успешно
            self.log(name + ' OK');
			delete self.actions[name];
            return; 
          }
          //counter++;
          //if (counter > maxRestartCount){
          if (seconds > 60*10) {
            self.log(name + ' ERROR');
			delete self.actions[name];
            return;
          }
          run();
        }, 
        timeout
      );
    }
	
  };
  
  
  ModuleBase.prototype.onDoorChanged = function(id){
    var vDev = this.getVDev(id);
    if (!vDev) {
      return;
    }
    var value = vDev.get("metrics:level") > 0 ? 'on' : 'off';
    
    if (this.state.doors[id] && this.state.doors[id].value == value) { //значение не изменилось
      return;
    }
   
    this.state.doors[id] = this.state.doors[id] || {};
    this.state.doors[id].value = value;
    this.state.doors[id].changeTime = Date.now();
    
    // обновляем общее состояние дверей
    // on - закрыта, off - открыта
    this.state.someDoorClosed = false;
    this.state.someDoorOpened = false;
    Object.keys(this.state.doors).forEach(function(key){
      if (this.state.doors[key].value == 'on') // закрыта
        this.state.someDoorClosed = true;
      else
        this.state.someDoorOpened = true;
    },this);
    
    this[value == 'on' ? 'onDoorClose' : 'onDoorOpen'].call(this, id); 
  }
  
  
  /*
  Если дверь открылась (любая на периметре помещения) - свет нужно включить
  Если дверь закрылась - кто-то либо вошел, либо вышел
    * Если нет движения внутри - выключить свет с минимальным таймаутом
    * Если есть движение внутри - то по окончании движения посчитать,
      как давно закрылась последняя дверь. 
        * Если меньше, чем 20 секунд назад - выключить свет с минимальным таймаута
        * Если больше, чем 20 секунд назад - не учитывать двери
  */
  ModuleBase.prototype.onDoorOpen = function(id){
    this.log('onDoorOpen: открыта дверь. userMode='+ this.state.userMode);
    if (this.state.userMode != 'off' && !this.state.light){
	  this.switchLight({mode:'on'});
      this.startTimer('offTimer', this.settings.intMotionTimeout*60, 
        this.onOffTimer, true);
    }
    //this.stopTimer('offTimer');
    //Object.keys(this.state.ignoreExtMotion).forEach(function(key){
    //  this.state.ignoreExtMotion[key] = false;
    //},this);
    //if (this.state.userMode != 'off' && !this.state.light){
    //  this.switchLight({mode:'on'});
    //  this.startTimer('offTimer', this.settings.extMotionTimeout)*60, 
    //    this.onOffTimer, true);
    //} 
  }
  
  ModuleBase.prototype.onDoorClose = function(id){
    this.log('onDoorOpen: закрыта дверь. userMode='+ this.state.userMode);
    //this.switchLight({mode:'off'});
    if (this.state.intM == 'on') return;
	if (this.state.userMode != 'on' && this.state.light) { // таймер взводим только если режим не on и не off
	  this.startTimer('offTimer', 
		this.settings.extMotionTimeout*60, 
		this.onOffTimer,
		true);
	}
  }
  
  
  ModuleBase.prototype.flog = function(){
    var a = 10;
  };
  
 
 
   (function restartSubclasses(){
     wrapper.log('restartSubclasses ' + Object.keys(wrapper.myZWay.modules).join(', '));
     Object.keys(wrapper.myZWay.modules).forEach(function(key){
       var module = wrapper.myZWay.modules[key];
       if (module && module.restartOnModuleBaseRefresh){
         wrapper.log('Restarting module ' + key);
         module.destroy.call(module);
         //module.init.call(module);
         if (module.initClass)
           module.initClass(wrapper.myZWay.ModuleBase);
         else 
           wrapper.log('module.initClass is not defined');
       }
     });
   })();
  
  /*
    Логика работы датчиков дверей
    * Датчиков в одном помещении может быть несколько (прихожая: вх. дверь, ванная, туалет)
    
    * Если дверь открылась - включить свет 
      
	}
  */


})()