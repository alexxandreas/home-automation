/*
global config, inherits, controller, MHA
*/


define('UtilsRoomHelpers', ['AbstractModule', 'DeviceStorage'], function(AbstractModule, DeviceStorage) {

    function UtilsRoomHelpers(config) {
        UtilsRoomHelpers.super_.call(this, config);
        this.name = 'UtilsRoomHelpers';
        this.log('construcror');

        //this._timers = {};
    }

    inherits(UtilsRoomHelpers, AbstractModule);

    /**
     * Если устройство с ключем key есть - возвращает объект
     * {
     *      level: 'on' / 'off',
     *      pendingLevel: 'on' / 'off' / level
     *      lastLevelChange : время с момента последнего изменения
     * }
     * Если устройства нет - возвращает объект
     * {
     *      level: undefined,
     *      pendingLevel: undefined,
     *      lastLevelChange: undefined,
     *      deviceNotExists: true
     * }
     */
    UtilsRoomHelpers.prototype.getDeviceData = function(key, convertToOnOff) {
        var dev = DeviceStorage.getDevice(key);

        if (dev) {
            var result = {
                level: dev.MHA.getLevel(),
                pendingLevel: dev.MHA.getPendingLevel(),
                lastLevelChange: dev.MHA.lastLevelChange(true)
            }
            if (convertToOnOff) {
                if (result.level == 0)
                    result.level = 'off';
                else if (result.level > 0)
                    result.level = 'on';
            }
        }
        else {
            var result = {
                level: undefined,
                pendingLevel: undefined,
                lastLevelChange: undefined,
                deviceNotExists: true
            }
        }
        return result;
    };
    // возвращает состояние света в комнате:
    /* {
     *   220:    'on' / 'off' / null
     *   12 :    'on' / 'off' / null
     *   summary:'on' / 'off' / null
     *  }
     *  {
     *       220: {
     *               level:    'on' / 'off' / null,
     *               lastLevelChange : время с момента последнего изменения / null
     *       },
     *       12: {
     *               level:    'on' / 'off' / null,
     *               lastLevelChange : время с момента последнего изменения / null
     *       },
     *       summary: {
     *               level:    'on' / 'off' / null,
     *               lastLevelChange : время с момента последнего изменения / null
     *       }
     *  }
     */
    UtilsRoomHelpers.prototype.getLightState = function(dev220key, dev12key) {
        var result = {
            '220': this.getDeviceData(dev220key, true),
            '12': this.getDeviceData(dev12key, true),
            summary: {
                level: null,
                lastLevelChange: null
            }
        };

        if (result['220'].level === 'on' || result['12'].level === 'on')
            result.summary.level = 'on'
        else if (result['220'].level == 'off' || result['12'].level == 'off')
            result.summary.level = 'off'

        if (result.summary.level)
            result.summary.lastLevelChange = Math.min(
                result['220'].lastLevelChange || Number.MAX_VALUE,
                result['12'].lastLevelChange || Number.MAX_VALUE
            );

        return result;
    }


    // возвращает состояние движения в комнате:
    /* {
     *   level:    'on' / 'off' / null,
     *   lastLevelChange : время с момента последнего изменения / null
     *  }
     */
    UtilsRoomHelpers.prototype.getMotionState = function(devMotionKey) {
        return this.getDeviceData(devMotionKey);
    };


    UtilsRoomHelpers.prototype.getFanState = function(devFanKey) {
        return this.getDeviceData(devFanKey);
    };
    
    
    
    /** EXT ROOMS **/

    // возвращает состояние датчиков движения в соседних комнатах:
    UtilsRoomHelpers.prototype.getExtRoomsMotionState = function(extRooms) {
        return this._getExtRoomsState(extRooms, 'motionSensor', true);
    };

    // возвращает состояние дверей:
    UtilsRoomHelpers.prototype.getExtRoomsDoorsState = function(extRooms) {
        return this._getExtRoomsState(extRooms, 'door', true);
    }

    // возвращает состояние 220-света:
    UtilsRoomHelpers.prototype.getExtRooms220State = function(extRooms) {
        return this._getExtRoomsState(extRooms, 'switch220', true);
    };

    // возвращает состояние датчиков влажности:
    UtilsRoomHelpers.prototype.getExtRoomsHumState = function(extRooms) {
        return this._getExtRoomsState(extRooms, 'switch220', false);
    };

    /** Универсальный метод, возвращает состояние указанного устройства 
     * в соседних комнатах
     * {
     *       rooms: [{
     *           level:    'on' / 'off' / null, 
     *           lastLevelChange : время с момента последнего изменения / null
     *       }],
     *       summary: {
     *           level:    'on' / 'off' / null, // если хотя бы один on - то on 
     *                      иначе если хотя бы один off - то off иначе null
     *           lastLevelChange : минимальное время с момента последнего изменения / null
     *       }
     *  }
     */
    UtilsRoomHelpers.prototype._getExtRoomsState = function(extRooms, param, convertToOnOff) {
        return extRooms.reduce((function(result, room) {
            if (!room[param]) return result;
            var devData = this.getDeviceData(room[param], convertToOnOff);
            result.rooms.push(devData);

            if (devData.level == 'on' || devData.level > 0)
                result.summary.level = 'on';
            else if ((devData.level == 'off' || devData.level == 0) && !result.summary.level)
                result.summary.level = 'off';

            if (devData.lastLevelChange)
                result.summary.lastLevelChange = Math.min(result.summary.lastLevelChange || Number.MAX_VALUE, devData.lastLevelChange);

            return result;
        }).bind(this), {
            rooms: [],
            summary: {
                level: null,
                lastLevelChange: null
            }
        });
    };


    UtilsRoomHelpers.prototype.stop = function(name) {
        UtilsRoomHelpers.super_.prototype.stop.apply(this, arguments);
    };

    return UtilsRoomHelpers;
});
