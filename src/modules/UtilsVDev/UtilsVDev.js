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
        return new DefaultMHA(key, vDev);
    };

    UtilsVDev.destroyMHA = function(vDev) {
        vDev.MHA && vDev.MHA.destroy && vDev.MHA.destroy();
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

        this._levelChangeHandlers = [];   

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
            this._levelChangeHandlers.forEach(function(obj) {
                try { // оборачиваем подписчики в try/catch, чтобы в случае ошибки не ломались другие модули
                    obj.handler.call(obj.scope, newLevel);
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

    // подписка на событие изменения значения
    DefaultMHA.prototype.onLevelChange = function(handler, scope) {
        this._levelChangeHandlers.push({
            handler: handler,
            scope: scope
        });
    };

    DefaultMHA.prototype._baseLevelChangeHandler = function() {
        this.getLevel();
    };

    // отписка от события изменения значения
    DefaultMHA.prototype.offLevelChange = function(handler, scope) {
        this._levelChangeHandlers = this._levelChangeHandlers.filter(function(obj) {
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

        if (command == 'on') {
            action = function() {
                this.vDev.performCommand('on');
            };
            check = function() {
                //log('check: level: ' + this.getLevel());
                return this.getLevel() === 'on' || this.getLevel() > 0;
            };
            this._pendingLevel = 'on';
        }
        else if (command == 'off') {
            action = function() {
                this.vDev.performCommand('off');
            };
            check = function() {
                //log('check: level: ' + this.getLevel());
                return this.getLevel() === 'off' || this.getLevel() === 0;
            };
            this._pendingLevel = 'off';
        }
        else if (command == 'exact') {
            action = function() {
                this.vDev.performCommand('exact', args);
            };
            check = function() {
                if (args.level) {
                    return this.getLevel() == args.level;
                }
                else {
                    return this.getLevel() !== 'off' && this.getLevel() !== 0;
                }
            };
            this._pendingLevel = args.level ? args.level : args;
        }


        if (!isPrevAction && check.call(this)) { // если проверка проходит сразу и небыло предыдущего действия - не запускаем 
            delete this._pendingLevel;
            //log()
            return;
        }

        this._actionObj = {
            action: action,
            check: check,
            startTime: Date.now(),
            log: log
        };

        this._run();
    };

    DefaultMHA.prototype._run = function() {

        //if (!self.actions[name]) return;

        // var seconds = Math.floor((Date.now() - self.actions[name].startTime)/1000);
        // сколько секунд прошло с запуска
        var seconds = Math.floor((Date.now() - this._actionObj.startTime) / 1000);

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

            this.run();
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



    UtilsVDev.prototype.stop = function() {
        UtilsVDev.super_.prototype.stop.apply(this, arguments);
    };


    return UtilsVDev;
});
