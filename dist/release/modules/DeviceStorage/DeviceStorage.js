/*
global config, inherits, controller, MHA
*/
define('DeviceStorage', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
   
   function DeviceStorage(config) {
        DeviceStorage.super_.call(this, config);
        this.name = 'DeviceStorage';
        this.log('construcror');

        this._initDevices();
        this._initFrontend();
        
    }

    inherits(DeviceStorage, AbstractModule);


    DeviceStorage.prototype._initDevices = function(){
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
        
        
        // массив названий комнат
        var namesArray = Object.keys(this.deviceNames).map(function(name){ return name.split('.').shift();});
        this.rooms = namesArray.filter(function(item, pos) {return namesArray.indexOf(item) == pos;});
        
        

        this.devices = {};

        // получаем все перечисленные устройства
        initDevices.call(this);

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
          getFGD211Scenes.call(this, key);
        }, this);


        function initDevices(){
            this.log('initDevices');
            Object.keys(this.deviceNames).forEach(function(key){
              var vDevs = getDevicesByName.call(this,this.deviceNames[key]);
              if (vDevs.length == 0){
                this.log('Error: initDevices(' + key + '): not found: ' + JSON.stringify(this.deviceNames[key]));
                //return null;
              } else if (vDevs.length > 1){
                var text = vDevs.map(function(vDev){
                  return vDev.id + '(' + vDev.get('metrics:title') + ')';
                }).join(', ');
                this.log('Error: initDevices(' + key + '): found ' + vDevs.length + 'devices: ' + text);
                //return null;
              } else {
                this._pushDevice(key, vDevs[0]);
              }
            //   this.devices[key] = vDevs[0];
              //return vDevs[0];
            }, this);
        }


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
        function getDevicesByName(parts){
            //this.log('getDevicesByName ' + JSON.stringify(parts));
            //var self = this;
            
            var devices=[];
            controller.devices.forEach(function(vDev){
              var devName = vDev.get('metrics:title') || '';
              devName = devName.toLowerCase();
              //self.log(devName);
              if (parts.every(function(part){
              if (part instanceof Array){
                  return part.some(function(subPart){
                      return devName.indexOf(subPart.toLowerCase()) >= 0;
                  });
                } else {
                  return devName.indexOf(part.toLowerCase()) >= 0;
              }
              })){ devices.push(vDev); }
            }, this);
            return devices;
        }


        // получение устройств-сцен для выключателей Fibaro FGD211
        function getFGD211Scenes(key){
            var vDev = this.getDevice(key);
            if (!vDev) return;

            //var scenes = [];
            var realId = this._getRealId(vDev.id);
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
                    this._pushDevice(key + '_' + sceneId, vDev);
                //   this.devices[key + '_' + sceneId] = vDev;
                }
            }, this);

        }
    };

    // Добавляет vDev в список устройств и инициализирует у него свойство MHA
    // key - ключ из this.deviceNames
    DeviceStorage.prototype._pushDevice = function(key, vDev){
        this.devices[key] = vDev;
        //this.log('pushing ' + key + ' ' + vDev.id);
        vDev.MHA = {
            key: key,
            deviceType: vDev.deviceType,

            // текущее значение
            _lastLevel: getLevel(),
            getLevel: (function(){
                var newLevel = getLevel();
                if (newLevel != vDev.MHA._lastLevel){
                    // обновляем значение 
                    vDev.MHA._lastLevel = newLevel;
                    vDev.MHA._lastLevelChange = Date.now();
                    // вызываем всех подписчиков
                    vDev.MHA._levelChangeHandlers.forEach(function(obj){
                        try { // оборачиваем подписчики в try/catch, чтобы в случае ошибки не ломались другие модули
                            obj.handler.call(obj.scope, newLevel);
                        } catch(err){
                            this.log('Error in levelChangeHandler (' + key + ') '  + err.toString() + ' ' + err.stack);
                        } 
                    }, this);
                }
                return newLevel;
            }).bind(this),

            // ожидаемое значение (вызвали изменение, но изменения еще не произошло)
            //_nextLevel: getLevel(),
            // nextLevel: function(){
            //     return vDev.MHA._nextLevel;
            // },

            // время последнего изменения
            // @param delta
            //     true: показать, сколько времени прошло с момента изменения
            //     иначе: когда произошло изменение
            _lastLevelChange: Date.now(),
            lastLevelChange: function(delta){
                if (delta)
                    return Date.now() - vDev.MHA._lastLevelChange;
                else
                    return vDev.MHA._lastLevelChange;
            },

            // подписка на событие изменения значения
            _levelChangeHandlers: [],
            onLevelChange: function(handler, scope){
                //////
                //var level = vDev.MHA.level();
                //listener.call(scope, level);
                vDev.MHA._levelChangeHandlers.push({
                    handler: handler,
                    scope: scope
                });
            },
            _baseLevelChangeHandler: function(){
                vDev.MHA.getLevel(); 
            },
            
            // массив модулей, которые используют девайс в текущий момент
            // когда модуль включает девайс - он добавляется в этот массив
            // когда выключает ('off') - удаляется из массива
            // т.е. если массив не пуст - девайс включен
            // initiator -> {params}
            _usedBy: {},
            performCommand: function(initiator, command, args){
                if (command == 'off'){
                    delete vDev.MHA._usedBy[initiator];
                } else if (command == 'on'){
                    vDev.MHA._usedBy[initiator] = {command: command};
                } else if (command == 'exact'){
                    vDev.MHA._usedBy[initiator] = {command: command, args: args};
                    // "exact", { level: 44 }
                    // "exect", { red: 12, green: 33, blue: 44 }
                }
                vDev.MHA._updateState();
            },
            
            // вызывает обновление состояние устройства в соответствии с текущими _usedBy
            _updateState: function(){
                var initiators = Object.keys(vDev.MHA._usedBy);
                
                var command='off';
                var args = {};
                
                initiators.forEach(function(initiator){
                    var obj = vDev.MHA._usedBy[initiator];
                    if (obj.command == 'on') // включаем безусловно
                        command = command;
                    else if (obj.command == 'exact' && obj.args){
                        if (obj.args.level != undefined){ // указан level
                            args.level = Math.max(args.level || 0, obj.args.level);
                        } else if (obj.args.red !== undefined || obj.args.green !== undefined || obj.args.blue != undefined) {
                            args.red = Math.max(args.red || 0, obj.args.red);
                            args.green = Math.max(args.green || 0, obj.args.green);
                            args.blue = Math.max(args.blue || 0, obj.args.blue);
                        }
                    }
                });
                
                vDev.MHA._action(command, args);
                
            },
            
            _actionObj: undefined,
            //_action: (function(action, check){
            _action: (function(command, args){
            	// оборачиваем логгер
            	var log = (function(data){
            	    return this.log(vDev.MHA.key 
            	    + ' action(' 
            	    + (command ? command : '') 
            	    + (args ? ', ' + JSON.stringify(args) : '') 
            	    + ') ' + data);
            	}).bind(this);
            	
            	var isPrevAction = !!vDev.MHA._actionObj;
            	// останавливаем предыдущее
            	if (isPrevAction){
            	    vDev.MHA._actionObj.timer && clearTimeout(vDev.MHA._actionObj.timer);
            	    log('STOP PREV');
            	}
            	vDev.MHA._actionObj = undefined;
	
	
                if (!action){ // останавливаем, если есть, и выходим
            		return;
            	}
            	
                
                
                var action;
                var check;
                
                if (command == 'on') {
                    action = function(){
                        vDev.performCommand('on');
                    };
                    check = function(){
                        vDev.MHA.getLevel() === 'on' || vDev.MHA.getLevel() > 0;
                    };
                } else if (command == 'off'){
                    action = function(){
                        vDev.performCommand('off');
                    }; 
                    check = function(){
                        vDev.MHA.getLevel() === 'off' || vDev.MHA.getLevel() === 0;
                    };
                } else if (command == 'exact') {
                    action = function(){
                        vDev.performCommand('exact', args);
                    };
                    check = function(){
                        if (args.level){
                            return vDev.MHA.getLevel() == args.level;
                        } else {
                            return vDev.MHA.getLevel() !== 'off' && vDev.MHA.getLevel() !== 0;
                        }
                    };
                }
                
                
                if (!isPrevAction && check()){ // если проверка проходит сразу и небыло предыдущего действия - не запускаем 
                    //log()
                    return;
                }
                
                vDev.MHA._actionObj = {
                    startTime: Date.now()
                };
                
                run();
    
                function run(){
                    //if (!self.actions[name]) return;
                    
                    // var seconds = Math.floor((Date.now() - self.actions[name].startTime)/1000);
                    // сколько секунд прошло с запуска
                    var seconds = Math.floor((Date.now() - vDev.MHA._actionObj.startTime)/1000);
                    
                    log((seconds > 0 ? '+' + seconds + ' sec' : 'START'));
                    // action.call(self);
                    action();
                    
                    var timeout = (Math.floor(seconds / 15)+1)*1000;
                    
                    vDev.MHA._actionObj.timer = setTimeout(function () { 
                        // if (check.call(self)) { // проверка прошла успешно
                        if (check()) { // проверка прошла успешно
                            log('OK');
                            //self.log(name + ' OK');
                            //delete self.actions[name];
                            vDev.MHA._actionObj = undefined;
                            return; 
                        }
                        //counter++;
                        //if (counter > maxRestartCount){
                        if (seconds > 60*10) {
                            log(' ERROR');
                            //delete self.actions[name];
                            vDev.MHA._actionObj = undefined;
                            return;
                        }
                        
                        run();
                    }, timeout);
                }
            }).bind(this)
            
            
        };
        controller.devices.on(vDev.id, 'change:metrics:level', vDev.MHA._baseLevelChangeHandler);
        
        this.log('device ' + key + ' added');
        function getLevel(){
            return vDev.get("metrics:level");
        }
    };

    DeviceStorage.prototype.getDevice = function(key){
        if (this.devices[key])
          return this.devices[key];
    //    if (!this.deviceNames[key]){
    //      this.log('Error: getDevice(' + key + '): устройства с таким ключем не определены');
    //    }
        return null;
    };



    // возвращает vDev по его id
    DeviceStorage.prototype.getVDev = function(id){
        var vDev = controller.devices.get(id);
        return vDev;
    };



    /** Получение id физического устройства */
    DeviceStorage.prototype._getRealId = function(vDevId){
        //var id = vDev.id;
        var id = vDevId;
        var res = id.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
        if (res.length >= 2) return res[1];
        return null;
    };


    DeviceStorage.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/:method', function(args){
    	    var method = args[0];
    	    if (method == 'state') {
    	        
    	        var data = Object.keys(this.devices).map(function(key){
                    var vDev = this.devices[key];
                    return {
                        key: key,
                        id: vDev.id,
                        title: vDev.get('metrics:title'),
                        level: vDev.MHA.getLevel(),
                        lastLevelChange: vDev.MHA.lastLevelChange(true)
                    };
                }, this);
    	        
    	        return ws.sendJSON(data);
    	    }
    	        
    	    
    	    return ws.sendError(404, method + ' not found');
    	}, this);
    	
    	WebServer.addPanel({
            title:'Device Storage',
            template: '/views/DeviceStorage/htdocs/DeviceStorage.html'
        });
    };
    
    
    DeviceStorage.prototype.stop = function(){
        Object.keys(this.devices).forEach(function(key){
            var vDev = this.devices[key];
            controller.devices.off(vDev.id, 'change:metrics:level', vDev.MHA._baseLevelChangeHandler);
            vDev.MHA._action(); // останавливаем action
            Object.keys(vDev.MHA).forEach(function(key){
                delete vDev.MHA[key];
            });
            delete vDev.MHA;
        }, this);
        
        DeviceStorage.super_.prototype.stop.apply(this, arguments);
    };

    return new DeviceStorage(config);

});

