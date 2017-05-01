/*
global config, inherits, controller, MHA
*/


define('UtilsRoomHelpers', ['AbstractModule', 'DeviceStorage'], function(AbstractModule, DeviceStorage){
    
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
     *      level: 'on' / 'off'
     *      lastLevelChange : время с момента последнего изменения
     * }
     * Если устройства нет - возвращает объект
     * {
     *      level: null,
     *      lastLevelChange: null
     * }
     */
    UtilsRoomHelpers.prototype.getDeviceData = function(key){
        var dev = DeviceStorage.getDevice(key);
        
        if (dev) return {
            level: dev.MHA.getLevel(),
            lastLevelChange: dev.MHA.lastLevelChange(true)
        } 
        else return {
            level: null,
            lastLevelChange: null
        }
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
    UtilsRoomHelpers.prototype.getLightState = function(dev220key, dev12key){
        var result = {
            '220': this.getDeviceData(dev220key),
            '12': this.getDeviceData(dev12key),
            summary: {
                level: null,
                lastLevelChange: null
            }
        };
        
        if (result['220'].level == 'on' || result['12'].level == 'on')
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
    UtilsRoomHelpers.prototype.getMotionState = function(devMotionKey){
        return this.getDeviceData(devMotionKey);
    };
   
    
    
    /** EXT ROOMS **/
     // возвращает состояние датчиков движения в соседних комнатах:
    /* {
    *       rooms: [{
    *           level:    'on' / 'off' / null,
    *           lastLevelChange : время с момента последнего изменения / null
    *       }],
    *       //summary: {
    *       //    level:    'on' / 'off' / null, // если хотя бы один on - то on
    *       //    lastLevelChange : минимальное время с момента последнего изменения / null
    *       //}
    *  }
    */
    UtilsRoomHelpers.prototype.getExtRoomsMotionState = function(extRooms){
        return extRooms.reduce(function(result, room){
            if (!room.motionSensor) return result;
            var devData = this.getDeviceData(room.motionSensor);
            result.rooms.push(devData);
            
            // TODO здесь какая-то обработка для summary
            return result;
        }, {
            rooms: []
        });
    };
    
    
    
     // возвращает состояние дверей:
    /* {
    *       rooms: [{
    *           level:    'on' / 'off' / null,
    *           lastLevelChange : время с момента последнего изменения / null
    *       }],
    *       //summary: {
    *       //    level:    'on' / 'off' / null, // если хотя бы один on - то on
    *       //    lastLevelChange : минимальное время с момента последнего изменения / null
    *       //}
    *  }
    */
    UtilsRoomHelpers.prototype.getExtRoomsDoorsState = function(extRooms){
        return extRooms.reduce(function(result, room){
            if (!room.door) return result;
            var devData = this.getDeviceData(room.door);
            result.rooms.push(devData);
            
            // TODO здесь какая-то обработка для summary
            return result;
        }, {
            rooms: []
        });
    }
    
    
    // возвращает состояние 220-света:
    /* {
    *       rooms: [{
    *           level:    'on' / 'off' / null,
    *           lastLevelChange : время с момента последнего изменения / null
    *       }],
    *       summary: {
    *           level:    'on' / 'off' / null, // если хотя бы один on - то on
    *           lastLevelChange : минимальное время с момента последнего изменения / null
    *       }
    *  }
    */
    UtilsRoomHelpers.prototype.getExtRooms220State = function(extRooms){
        return extRooms.reduce(function(result, room){
            if (!room.switch220) return result;
            var devData = this.getDeviceData(room.switch220);
            result.rooms.push(devData);
            
            // TODO здесь какая-то обработка для summary
            if (devData.level == 'on')
                result.summary.level = 'on';
        
            if (devData.lastLevelChange)
                result.summary.lastLevelChange = Math.min(result.summary.lastLevelChange || Number.MAX_VALUE, devData.lastLevelChange);
            
            return result;
        }, {
            rooms: [],
            summary: {
                level: null,
                lastLevelChange: null
            }
        });
    }
    
   
    UtilsRoomHelpers.prototype.stop = function(name){
        UtilsRoomHelpers.super_.prototype.stop.apply(this, arguments);
    };
    
    return UtilsRoomHelpers;
});