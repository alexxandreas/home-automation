/* global loadObject saveData MHA fs  */

(function() {

    /**
     * Инициализация:
     * Загрузить список всех доступных модулей без загрузки самих модулей
     * Загрузить конфиг со включенными модулями
     * Поочередно загружать и выполнять модули
     * Модули вызывают define, где определяют свои зависимости
     * Проходить по всем зависимостям и загружать их
     * После прохода вызывать фунцию создания модуля
     * 
     * Выключение/перезагрузка модуля:
     * Поиском в глубину обойти модули, зависящие от текущего. При нахождении
     *      модуля, от которого ничего не зависит - добавлять его в массив
     * Прямым проходом по массиву отключить и выгрузить модули
     * Если перезагрузка - прямым проходом по массиву загрузить модули
     * 
     * 
     */
    function ModuleLoader(config) {
        this.name = 'ModuleLoader';

        this.start();
    }

    ModuleLoader.prototype.start = function start() {
        this.log('start');
        
        // список модулей в ФС
        //this.modulesFS = {}; 
        this.loadModulesList();

        // конфиг вида name -> {config:{}, created:Boolean}
        //this.modulesConfig = {};
        this.loadModulesConfig();


        // загружаем модули из конфига
        setTimeout((function() {
            // загружаем модули из конфига
            Object.keys(this.modulesConfig).forEach(function(name) {
                this._loadModule(name);
            }, this);
        }).bind(this), 1);
    }

    // Загружает список модулей из ФС
    ModuleLoader.prototype.loadModulesList = function loadModulesList() {
        this.modules = {};
        var folder = MHA.fsRoot + 'modules/';
        var list = fs.list(folder);
        list.forEach(function(name) {
            var statDir = fs.stat(folder + name);
            var statFile = fs.stat(folder + name + '/' + name + '.js');
            if (statDir && statDir.type == 'dir' && statFile && statFile.type == 'file') {
                if (!this.modules[name]) {
                    this.modules[name] = {
                        name: name,
                        deps: [], // текущий модуль зависит от этих
                        //depsFrom: [], // текущий модуль зависит от этих
                        //depsTo: [], // эти модули зависят от текущего
                        loaded: false, // файл модуля загружен из ФС и выполнен

                        func: null, // функция-конструктор, определенная через define
                        created: false, // был ли модуль создан, или ждет зависимостей
                        module: null // ссылка на созданный модуль
                    }
                }
                var showInUIFile = fs.stat(folder + name + '/' + 'showInUI');
                if (showInUIFile && showInUIFile.type == 'file') {
                    this.modules[name].visible = true;
                }
            }
        }, this);
        this.log("Finded modules: [" + Object.keys(this.modules).join(', ') + ']');
    };


    ModuleLoader.prototype._loadModule = function _loadModule(name) {
        var module = this.modules[name];
        if (module && module.loaded) {
            return;
        }
        if (!module) {
            this.log('loadModule: Error: module ' + name + ' not found!');
            return;
        }

        try {
            this.log('loadModule ' + name);
            //var config = moduleObj.config;
            var define = this._define.bind(this);
            // 		var require = this._require.bind(this);
            // 		var asyncCall = this._asyncCall.bind(this);

            // TODO проверить, есть ли файл
            var moduleStr = fs.load(MHA.fsRoot + 'modules/' + name + '/' + name + '.js');
            moduleStr = decodeURIComponent(escape(moduleStr));
            eval(moduleStr);
            //if (!module) throw new Error('module ' + moduleObj.name + ' not loaded!');
            //this.modules[moduleObj.name] = module;
            module.loaded = true;
        }
        catch (err) {
            this.log('loadModule: Error: ' + err.toString() + '\n' + err.stack);
            //this._unloadModules();
            return;
        }
    };



    ModuleLoader.prototype._define = function _define(name, deps, func) {
        this.log('define ' + name);
        var module = this.modules[name];
        if (!module) {
            this.log('define Error: module ' + name + ' not found!');
            return;
        }
        module.deps = deps instanceof Array ? deps : [];
        module.func = func;

        this._startModule(name);
    };

    // ModuleLoader.prototype._require = function(name) {
    //     this.log('require ' + name);
    //     //this._loadModule(name);
    //     var module = this.modules[name];
    //     return module ? module.module : undefined;
    // };


    ModuleLoader.prototype._startModule = function _startModule(name) {
        //this.log('startModule ' + name);
        var module = this.modules[name];
        if (!module) {
            this.log('startModule Error: module ' + name + ' not found!');
            return;
        }
        if (!module.func) {
            this.log('startModule Error: module ' + name + ' not defined!');
            return;
        }
        if (module.created) {
            return;
        }

        module.deps.forEach(function(depName) {
            // зависимости загружаются и запускаются
            this._loadModule(depName);
        }, this);


        if (module.deps.every(function(depName) {
                return this.modules[depName] && this.modules[depName].created;
            }, this)) { // все зависимости загружены (и, если был define - запущены)
            var depsA = module.deps.map(function(depName) {
                return this.modules[depName].module;
            }, this);

            // загрузка модуля
            try {
                this.log('startModule ' + name);
                module.module = module.func.apply(this, depsA);
                module.created = true;
            }
            catch (err) {
                this.log('startModule Error creating module ' + module.name + ':\n' + err.toString() + '\n' + err.stack);
                this._unloadModule(name);
            }
        }
        else {
            var notLoadedDeps = module.deps.filter(function(depName) {
                return !this.modules[depName].created;
            }, this).join(' ,');
            this.log('startModule Error: module ' + name + ' can\' load deps: [' + notLoadedDeps + ']')
            this._unloadModule(name);
        };
    };

    // выгружает модуль и все его зависимости
    // возвращат массив затронутых модулей
    ModuleLoader.prototype._unloadModule = function _unloadModule(name, reload) {
        var module = this.modules[name];
        if (!module) {
            this.log('unloadModule Error: module ' + name + ' not found!');
            return;
        }
        // if (!module.module){
        //     return;
        // }

        var deps = this._getDepsTree(name);

        deps.forEach(function(depName) {
            var depMod = this.modules[depName];
            try {
                this.log('unloadModule ' + depMod.name);
                depMod.module && depMod.module.stop && depMod.module.stop();
                depMod.func = null;
                depMod.module = null;
                depMod.deps = [];
                depMod.created = false;
                depMod.loaded = false;
            }
            catch (err) {
                this.log('unloadModule Error: can\'t unload module ' + depMod.name + ':\n' + err.toString() + '\n' + err.stack);
            }
        }, this);

        if (!reload) return deps;

        deps = deps.reverse();
        deps.forEach(function(depName) {
            this._loadModule(depName);
        }, this);

        return deps;
    };

    ModuleLoader.prototype._getDepsTree = function _getDepsTree(name) {
        var module = this.modules[name];
        var deps = [];
        rec.call(this, name);
        deps = deps.filter(function(item, pos) {
            return deps.indexOf(item) == pos;
        });
        return deps;

        function rec(name) {
            var module = this.modules[name];
            // зависящие модули
            var depMods = Object.keys(this.modules).filter(function(depName) {
                var depMod = this.modules[depName];
                return depMod.created && depMod.deps.indexOf(name) >= 0;
            }, this);
            // вызываем рекурсию для них
            depMods.forEach(function(depName) {
                rec.call(this, depName);
            }, this);
            deps.push(name);
        }
    };

    ModuleLoader.prototype.activateModule = function activateModule(name) {
        this._loadModule(name);
        this.modulesConfig[name] = true;
        this.saveModulesConfig();
    };

    ModuleLoader.prototype.deactivateModule = function deactivateModule(name) {
        var deps = this._unloadModule(name);
        deps.forEach(function(depName) {
            delete this.modulesConfig[depName];
        }, this);
        this.saveModulesConfig();
        return deps;
    };

    ModuleLoader.prototype.restartModule = function restartModule(name) {
        var deps = this._unloadModule(name, true);
        return deps;
    };
    
    ModuleLoader.prototype.restart = function() {
       this.log('restart');
       this.stop();
       this.start();
    };



    ModuleLoader.prototype.loadModulesConfig = function loadModulesConfig() {
        this.modulesConfig = this.loadData('modulesConfig') || {
            'DeviceStorage': true,
            'ControlPanel': true,
            'RemoteConsole': true
        };
    };

    ModuleLoader.prototype.saveModulesConfig = function saveModulesConfig() {
        this.saveData('modulesConfig', this.modulesConfig);
    };



    ModuleLoader.prototype.loadData = function loadData(key) {
        var objName = 'MHA_' + key;
        this.log('loadData: ' + objName);
        return loadObject(objName);
    };

    ModuleLoader.prototype.saveData = function saveData(key, value) {
        var objName = 'MHA_' + key;
        this.log('saveData: ' + objName);
        saveObject(objName, value);
    };



    ModuleLoader.prototype.log = function log(data) {
        return MHA.prefixLog(this.name, data);
    };

    ModuleLoader.prototype.stop = function stop() {
        this.log('stop');
        // выгружаем модули
        Object.keys(this.modules).forEach(function(name) {
            this._unloadModule(name);
        }, this);
    }

    MHA.ModuleLoader = new ModuleLoader();
    return MHA.ModuleLoader;
    //return ModuleLoader;

})()
