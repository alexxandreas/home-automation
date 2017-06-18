/*
global config, inherits, controller, MHA
*/

define('UtilsVDev', ['AbstractModule'], function(AbstractModule) {

    function UtilsVDev(config) {
        UtilsVDev.super_.call(this, config);
    }

    inherits(UtilsVDev, AbstractModule);

    // static
    UtilsVDev.createMHA = function(key, type, vDev) {
        var mha = type && type.mha;
        
        if (mha == 'door')
            return new DoorMHA(key, vDev);
        else if (mha == 'virtualDoor')
            return new VirtualDoorMHA(key, vDev);
        else if (mha == 'tabletopSwitch')
            return new TabletopSwitchMHA(key, vDev);
        else if (mha == 'FGD211') 
            return new FGD211MHA(key, vDev);  
        else if (mha == 'rgb')
            return new RGBMHA(key, vDev);
        else if (mha == 'switchOnOff')
            return new SwitchOnOff(key, vDev);
        
            
        return new DefaultMHA(key, vDev);
    };

    UtilsVDev.destroyMHA = function(vDev) {
        vDev.MHA && vDev.MHA.destroy && vDev.MHA.destroy();
    };


    UtilsVDev.prototype.stop = function() {
        UtilsVDev.super_.prototype.stop.apply(this, arguments);
    };
    
    
    

    /**********************************************************/
    /************************ Default *************************/
    /**********************************************************/

    function DefaultMHA(key, vDev) {
        this.key = key;
        this.vDev = vDev;
        vDev.MHA = this;   

        // время последнего изменения значения
        this._lastLevelChange = Date.now();

        this._eventHandlers = [];   

        // массив модулей, которые используют девайс в текущий момент
        // когда модуль включает девайс - он добавляется в этот массив
        // когда выключает ('off') - удаляется из массива
        // т.е. если массив не пуст - девайс включен
        // initiator -> {params}
        this._usedBy = {};

        this._actionObj = undefined;
        
         // текущее значение
        this._lastLevel = this.getLevel();
        
        this._pendingLevel = undefined;
        
        this._baseLevelChangeHandler = this.getLevel.bind(this);

        controller.devices.on(vDev.id, 'change:metrics:level', this._baseLevelChangeHandler);
    }

    DefaultMHA.prototype.log = function(data) {
        return MHA.prefixLog('UtilsVDev(' + this.key + ')', data);
    };

    DefaultMHA.prototype.getLevel = function() {
        var newLevel = this._getLevel();
        if (newLevel != this._lastLevel) {
            // обновляем значение 
            this._lastLevel = newLevel;
            this._lastLevelChange = Date.now();
            // вызываем всех подписчиков
            this._eventHandlers.forEach(function(obj) {
                var event = {
                    type: 'level',
                    level: newLevel
                };
                try { // оборачиваем подписчики в try/catch, чтобы в случае ошибки не ломались другие модули
                    obj.handler.call(obj.scope, event);
                }
                catch (err) {
                    // TODO 
                    // this.log('Error in levelChangeHandler (' + key + ') ' + err.toString() + ' ' + err.stack);
                }
            }, this);
        }
        return newLevel;
    };
    
    
    /**
     * Возвращает уровень, который должен быть установлен для 
     * устройства, но пока еще не установился по причине затупа сети
     */
    DefaultMHA.prototype.getPendingLevel = function(){
        //if (this._pendingLevel !== undefined)
            return this._pendingLevel;
        //else 
        //    return this.getLevel();
    }

    DefaultMHA.prototype._getLevel = function() {
        return this.vDev.get("metrics:level");
    }

    DefaultMHA.prototype.lastLevelChange = function(delta) {
        if (delta)
            return Date.now() - this._lastLevelChange;
        else
            return this._lastLevelChange;
    };

    

    DefaultMHA.prototype.onEvent = function(handler, scope) {
        this._eventHandlers.push({
            handler: handler,
            scope: scope
        });
    };
    
    // подписка на событие изменения значения
    // DefaultMHA.prototype._baseLevelChangeHandler = function() {
    //     this.getLevel();
    // };

    // отписка от события изменения значения
    DefaultMHA.prototype.offEvent = function(handler, scope) {
        this._eventHandlers = this._eventHandlers.filter(function(obj) {
            return (obj.handler != handler);
        });
    };

    /**
     * initiator - название модуля, который запросил изменение значения
     * command - команда для выполнения. приоритет команд: exact, on, off
     * args - аргументы команды
     * 
     * command = 'on'
     * command = 'off'
     *      args = {force: true} - выключить устройство, даже если его используют другие
     * command = 'exact'
     *      args = {level: 44} - установить уровень 44, по умолчанию - 0
     *      args = {red: 12, green: 33, blue: 44} - установить уровни для RGB
     */
    DefaultMHA.prototype.performCommand = function(initiator, command, args) {
        if (command == 'off') {
            delete this._usedBy[initiator];
            if (args && args.force) { // принудительно выключаем
                this._usedBy = {};
            }
        }
        else if (command == 'on') {
            this._usedBy[initiator] = {
                command: command
            };
        }
        else if (command == 'exact') {
            this._usedBy[initiator] = {
                command: command,
                args: args
            };
            // "exact", { level: 44 }
            // "exect", { red: 12, green: 33, blue: 44 }
        }
        this._updateState();
    };

    // вызывает обновление состояние устройства в соответствии с текущими _usedBy
    DefaultMHA.prototype._updateState = function() {
        var initiators = Object.keys(this._usedBy);

        var command = 'off';
        var args = {};

        initiators.forEach(function(initiator) {
            var obj = this._usedBy[initiator];
            if (obj.command == 'exact' && obj.args) {
                if (obj.args.level != undefined && obj.args.level != 0) { // указан level
                    command = 'exact';
                    args.level = Math.max(args.level || 0, obj.args.level);
                }
            }
            else if (obj.command == 'on' && command != 'exact') { // включаем безусловно
                command = 'on';
            }
        }, this);

        this._action(command, args);
    };

    DefaultMHA.prototype._action = function(command, args) {
        // оборачиваем логгер

        var log = (function(data) {
            return this.log(
                'action(' +
                (command ? command : '') +
                (args ? ', ' + JSON.stringify(args) : '') +
                ') ' + data);
        }).bind(this);


        var isPrevAction = !!this._actionObj;
        // останавливаем предыдущее
        if (isPrevAction) {
            this._actionObj.timer && clearTimeout(this._actionObj.timer);
            log('STOP PREV');
        }
        
        delete this._actionObj;
        delete this._pendingLevel;

        // если команда пустая - значит это команда отмены любого действия - выходим
        if (!command) {
            return;
        }

        log("");

        
        var action;
        var check;

        var actionCommand;

        if (command == 'on') {
            actionCommand = this._getOnCommand();
        }
        else if (command == 'off') {
            actionCommand = this._getOffCommand();
        }
        else if (command == 'exact') {
            actionCommand = this._getExactCommand(args);
        }
        

        if (!isPrevAction && actionCommand.check.call(this)) { // если проверка проходит сразу и небыло предыдущего действия - не запускаем 
            return;
        }
        
        this._pendingLevel = actionCommand.pendingLevel;

        this._actionObj = {
            action: actionCommand.action,
            check: actionCommand.check,
            startTime: Date.now(),
            log: log
        };

        this._run();
    };
    
    
    DefaultMHA.prototype._getOnCommand = function(){
        return {
            action:function() {
                this.vDev.performCommand('on');
            },
            check: function() {
                return this.getLevel() === 'on' || this.getLevel() > 0;
            },
            pendingLevel: 'on'
        }
    };
    
    DefaultMHA.prototype._getOffCommand = function(){
        return {
            action: function() {
                this.vDev.performCommand('off');
            },
            check: function() {
                return this.getLevel() === 'off' || this.getLevel() === 0;
            },
            pendingLevel: 'off'
        }
    };
    
    DefaultMHA.prototype._getExactCommand = function(args){
        return {
            action: function() {
                this.vDev.performCommand('exact', args);
            },
            check: function() {
                if (args.level) {
                    return this.getLevel() == args.level;
                }
                else {
                    return this.getLevel() !== 'off' && this.getLevel() !== 0;
                }
            },
            pendingLevel: args.level ? args.level : args
        }
    };
    
   
    DefaultMHA.prototype._run = function() {

        //if (!self.actions[name]) return;

        // var seconds = Math.floor((Date.now() - self.actions[name].startTime)/1000);
        // сколько секунд прошло с запуска
        //var seconds = Math.floor((Date.now() - this._actionObj.startTime) / 1000);
        var seconds = (Date.now() - this._actionObj.startTime);
        seconds = seconds > 1000 ? Math.floor(seconds) : seconds / 1000;

        this._actionObj.log((seconds > 0 ? '+' + seconds + ' sec' : 'START'));
        // action.call(self);
        this._actionObj.action.call(this);

        var timeout = (Math.floor(seconds / 15) + 1) * 1000;

        this._actionObj.timer = setTimeout((function() {
            // if (check.call(self)) { // проверка прошла успешно
            if (this._actionObj.check.call(this)) { // проверка прошла успешно
                this._actionObj.log('OK');
                //self.log(name + ' OK');
                //delete self.actions[name];
                delete this._actionObj;
                delete this._pendingLevel;
                return;
            }
            //counter++;
            //if (counter > maxRestartCount){
            if (seconds > 60 * 10) {
                this._actionObj.log('ERROR');
                //delete self.actions[name];
                delete this._actionObj;
                delete this._pendingLevel;
                return;
            }

            this._run();
        }).bind(this), timeout);

    };

    DefaultMHA.prototype.destroy = function() {
        controller.devices.off(this.vDev.id, 'change:metrics:level', this._baseLevelChangeHandler);
        this._action(); // останавливаем action
        // Object.keys(vDev.MHA).forEach(function(key) {
        //     delete vDev.MHA[key];
        // });
        delete this.vDev.MHA;
        delete this.vDev;
    };

    
    
    
    
    
    /**********************************************************/
    /************************** RGB ***************************/
    /**********************************************************/
    
    function RGBMHA(key, vDev) {
        RGBMHA.super_.apply(this, arguments);
    }

    inherits(RGBMHA, DefaultMHA);
    
    /**
     *  Возвращает установленный цвет в формате {"r": 90, "g": 45, "b": 45}
     */
    RGBMHA.prototype.getColor = function() {
        return this.vDev.get("metrics:color");
    }
    
    // вызывает обновление состояние устройства в соответствии с текущими _usedBy
    DefaultMHA.prototype._updateState = function() {
        var initiators = Object.keys(this._usedBy);

        var command = 'off';
        var args = {};

        initiators.forEach(function(initiator) {
            var obj = this._usedBy[initiator];
            if (obj.command == 'exact' && obj.args) {
                if (obj.args.level != undefined && obj.args.level != 0) { // указан level
                    command = 'exact';
                    args.level = Math.max(args.level || 0, obj.args.level);
                }
                else if (obj.args.red !== undefined || obj.args.green !== undefined || obj.args.blue != undefined) {
                    command = 'exact';
                    args.red = Math.max(args.red || 0, obj.args.red);
                    args.green = Math.max(args.green || 0, obj.args.green);
                    args.blue = Math.max(args.blue || 0, obj.args.blue);
                }
            }
            else if (obj.command == 'on' && command != 'exact') { // включаем безусловно
                command = 'on';
            }
        }, this);

        this._action(command, args);
    };
    
    RGBMHA.prototype._getExactCommand = function(args){
        return {
            action: function() {
                this.vDev.performCommand('exact', args);
            },
            
            check: function() {
                if (args.level) {
                    return this.getLevel() == args.level;
                }
                else if (args.red != undefined || args.green != undefined || args.blue != undefined){
                    var color = this.getColor();
                    return color.r == args.red && color.g == args.green && color.b == args.blue;
                } 
                else {
                    return this.getLevel() !== 'off' && this.getLevel() !== 0;
                }
            },
            pendingLevel: args.level ? args.level : args
        }
    };
    
    
    
    
    
    /**********************************************************/
    /************************** DOOR **************************/
    /**********************************************************/
        
    function DoorMHA(key, vDev) {
        DoorMHA.super_.apply(this, arguments);
    }

    inherits(DoorMHA, DefaultMHA);
    
    DoorMHA.prototype._getLevel = function() {
        var level = this.vDev.get("metrics:level");
        if (level == 'on' || level > 50) {
            return 'off'; // закрыта
        } else {
            return 'on' // открыта
        }
    }
    
    
    
    
    
    /**********************************************************/
    /********************** VIRTUAL DOOR **********************/
    /**********************************************************/
        
    function VirtualDoorMHA(key, vDev) {
        VirtualDoorMHA.super_.apply(this, arguments);
        
        this.closeTime = 5*1000; // время в мс, через которое дверь будет закрыта
    }

    inherits(VirtualDoorMHA, DefaultMHA);
    
    VirtualDoorMHA.prototype._getLevel = function() {
        var level = this.vDev.get("metrics:level");
        var mode = level > 10 ? 'on' : 'off';
        
        this.clearCloseDoorTimer();
        
        // если дверь открылась - сразу возвращаем результат
        if (mode == 'on') {
            this._closeTime = null;
            return 'on';
        }
        
        if (this._lastLevel == 'off') {
            this._closeTime = null;
            return 'off';
        }
        
        if (!this._closeTime) {
            this._closeTime = Date.now();
            
            this.closeDoorTimeout = setTimeout(
                this.onCloseDoorTimer.bind(this), 
                this.closeTime + 50
            );
        } else {
            var timeFromClose = Date.now() - this._closeTime;
            if (timeFromClose > this.closeTime){
                this._closeTime = null;
                return 'off';
            } else {
                this.closeDoorTimeout = setTimeout(
                    this.onCloseDoorTimer.bind(this), 
                    this.closeTime - timeFromClose + 50
                );
            }
        }
        
        return 'on';
    }
    
    VirtualDoorMHA.prototype.onCloseDoorTimer = function(){
        this.clearCloseDoorTimer();
        this.getLevel();
    }
    
    VirtualDoorMHA.prototype.clearCloseDoorTimer = function(){
        this.closeDoorTimeout && clearTimeout(this.closeDoorTimeout);
        this.closeDoorTimeout = null;
    }
    
    VirtualDoorMHA.prototype.destroy = function() {
        this.clearCloseDoorTimer();
        VirtualDoorMHA.super_.prototype.destroy.apply(this, arguments);
    }
    
    
    
    
    
    /**********************************************************/
    /********************* TabletopSwitch *********************/
    /**********************************************************/
        
    function TabletopSwitchMHA(key, vDev) {
        TabletopSwitchMHA.super_.apply(this, arguments);
    }

    inherits(TabletopSwitchMHA, DefaultMHA);
    
    TabletopSwitchMHA.prototype._getLevel = function() {
        var level = this.vDev.get("metrics:level");
        var mode = level > 70 ? 'off' : level > 35 ? 'half' : 'on';
        return mode;
    }
    

    /**********************************************************/
    /*********************** SwitchOnOff **********************/
    /**********************************************************/
        
    function SwitchOnOff(key, vDev) {
        SwitchOnOff.super_.apply(this, arguments);
    }

    inherits(SwitchOnOff, DefaultMHA);
    
    SwitchOnOff.prototype.performCommand = function(initiator, command, args) {
        var newCommand = command;
        if (command == 'exact') {
            if (args && args.level > 0)
                newCommand = 'on';
            else
                newCommand = 'off';
        }
        this.log('SwitchOnOff.performCommand: ' + command + ' ' + JSON.stringify(args) + ' -> ' + newCommand);
        return SwitchOnOff.super_.prototype.performCommand.call(this, initiator, newCommand);
    }
    
   
   
   
    
    /**********************************************************/
    /************************* FGD211 *************************/
    /**********************************************************/
        
    function FGD211MHA(key, vDev) {
        FGD211MHA.super_.apply(this, arguments);
        
        this._scenes = {
            '10': {name: "UpClick"}, //"Switch from off to on",
            '11': {name: "DownClick"}, //"Switch from on to off",
            //12: "S1 holding down",
            '13': {name: "UpDownRelease"}, //"S1/S2 releasing",
            '14': {name: "UpDoubleClick"}, //"S1 double click",
            //15: "S1 triple click",
            //16: "S1 single click",
            '17': {name: "UpHold"}, //"S1 Brighten",
            '18': {name: "DownHold"} //"S2 Dim"
            //22: "S2 holding down",
            //23: "S2 releasing",
            //24: "S2 double click",
            //25: "S2 triple click",
            //26: "S2 single click"
            
        };
        
        
        this._initScenes();
    }

    inherits(FGD211MHA, DefaultMHA);
    
    FGD211MHA.prototype._initScenes = function() {
        Object.keys(this._scenes).forEach(function(sceneId) {
            this._initScene(sceneId);
        }, this); 
    }
    
    FGD211MHA.prototype._initScene = function(sceneId) {
        //this.log('initScene(' + sceneId + ': ' + this._scenes[sceneId].name + ')')
        var realId = this._getRealId();
        if (realId == null) return;

        var sceneName = "ZWayVDev_zway_Remote_" + realId + "-0-0-" + sceneId + "-S";
        
        // var vDev = this.getVDev(sceneName);
        // if (!vDev) {
        //     this.log('Error: сцена ' + sceneId + ' для ' + key + ' не найдена');
        // }
        // else {
        //     this._pushDevice(key + '_' + sceneId, this._deviceTypes.scene, vDev);
        // }
        
        var handler = this._baseSceneHandler.bind(this, sceneId);
        
        this._scenes[sceneId].sceneName = sceneName;
        this._scenes[sceneId].handler = handler
        
        controller.devices.on(sceneName, 'change:metrics:level', handler);
        
    };
    
    FGD211MHA.prototype._baseSceneHandler = function(sceneId){
        this._eventHandlers.forEach(function(obj) {
            var event = {
                type: 'scene',
                sceneId: sceneId,
                name: this._scenes[sceneId].name
            };
            try { // оборачиваем подписчики в try/catch, чтобы в случае ошибки не ломались другие модули
                obj.handler.call(obj.scope, event);
            }
            catch (err) {
                // TODO 
                // this.log('Error in levelChangeHandler (' + key + ') ' + err.toString() + ' ' + err.stack);
            }
        }, this);
    }
    
    /** Получение id физического устройства */
    FGD211MHA.prototype._getRealId = function(vDevId) {
        //var id = vDev.id;
        var id = this.vDev.id;
        var res = id.match(/\D*(\d*).*/); // все не-числа (число) все-остальное
        if (res.length >= 2) return res[1];
        return null;
    };
    
    FGD211MHA.prototype.destroy = function() {
        Object.keys(this._scenes).forEach(function(sceneId) {
            if (this._scenes[sceneId].handler)
                controller.devices.off(this._scenes[sceneId].sceneName, 'change:metrics:level', this._scenes[sceneId].handler);
        }, this); 
        
        FGD211MHA.super_.prototype.destroy.apply(this, arguments);
    }
   
    




    return UtilsVDev;
});
