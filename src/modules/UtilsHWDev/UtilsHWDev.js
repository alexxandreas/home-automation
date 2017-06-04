/*
global config, inherits, controller, MHA, zway
*/

define('UtilsHWDev', ['AbstractModule'], function(AbstractModule) {

    function UtilsHWDev(config) {
        UtilsHWDev.super_.call(this, config);
    }

    inherits(UtilsHWDev, AbstractModule);

    // static
    // UtilsHWDev.createMHA = function(key, type, vDev) {
    //     var mha = type && type.mha;
        
    //     if (mha == 'door')
    //         return new DoorMHA(key, vDev);
    //     else if (mha == 'virtualDoor')
    //         return new VirtualDoorMHA(key, vDev);
    //     else if (mha == 'tabletopSwitch')
    //         return new TabletopSwitchMHA(key, vDev);
    //     else if (mha == 'FGD211') 
    //         return new FGD211MHA(key, vDev);  
    //     else if (mha == 'rgb')
    //         return new RGBMHA(key, vDev);
        
            
    //     return new DefaultMHA(key, vDev);
    // };

    // UtilsHWDev.destroyMHA = function(vDev) {
    //     vDev.MHA && vDev.MHA.destroy && vDev.MHA.destroy();
    // };


    // UtilsHWDev.prototype.stop = function() {
    //     UtilsHWDev.super_.prototype.stop.apply(this, arguments);
    // };
    
    
    

    /**********************************************************/
    /************************* HWDev **************************/
    /**********************************************************/

    /**
     * config.configParams = {1:10, 2:15}
     */
    UtilsHWDev.HWDev = function(config){
        config = config || {};
        
        // в configParams попадают только те параметры, у которых 
        // задано value (по умолчанию, либо через конфиг)
        this.configParams = {};
        Object.keys(this.defaultConfigParams).forEach(function(key){
            var value;
            if (config.configParams)
                value = config.configParams[key];
            if (value === undefined) 
                value = this.defaultConfigParams[key].value;
            
            if (value == null) return;
            this.configParams[key] = value;
        }, this);
        
        this.id = config.id
    };
    
    UtilsHWDev.HWDev.prototype.setId = function(id) {
        this.id = id;
    };
    
    UtilsHWDev.HWDev.prototype.getConfigParam = function(num) {
        // see zway.pdf :: command class: Configuration
        //return 
        try {
            var value = getValue(this.id, num);
            // if (value == null) {
            //     zway.devices[this.id].instances[0].commandClasses[112].Get(num, function(){
            //         value = getValue(num);
            //     }, function(){
            //         value = getValue(num);
            //     })
            // }
        } catch (err) {
            
        }
        
        return value;
        
        function getValue(devId, paramId){
            return zway.devices[devId].instances[0].commandClasses[112].data[paramId].val.value;
        }
    };
    
    UtilsHWDev.HWDev.prototype.setConfigParam = function(num) {
        
    };
    
    UtilsHWDev.HWDev.prototype.checkConfigParam = function() {
        var checklist = {};
        Object.keys(this.configParams).forEach(function(key){
            var value = this.getConfigParam(key);
            checklist[key] = {
                value: value,
                configValue: this.configParams[key],
                passed: value == this.configParams[key]
            }
        }, this);
        return checklist;
    };
    
    
    
    

    /**********************************************************/
    /************************* HWDev **************************/
    /**********************************************************/

    UtilsHWDev.FGD211 = function(config){
        
        
        this.defaultConfigParams = {
            1: {
                value: 0,
                name: 'Activate / deactivate functions ALL ON / ALL OFF'
                //def: 255,
            },
            6: {
                value: 0,
                name: 'Sending commands to control devices assigned to 1-st association group (key № 1)'
            },
            7: {
                value: 0,
                name: 'Checking the device status before sending a control frame from the key no. 2'
            },
            8: {
                value: 1,
                name: 'The percentage of dimming step at automation control'
            },
            9: {
                value: 5,
                name: 'Time of manually moving the Dimmer between the extreme dimming values (in 10 ms)'
            },
            10: {
                value: 3, 
                name: 'Time of Automatic moving the Dimmer between the extreme dimming values'
            }, 
            11: {
                value: 1,
                name: 'The percentage of a dimming step at manual control'
            },
            12: {
                value: 99,
                name: 'Maximum Dimmer level control'
            },
            13: {
                value: 1,
                name: 'Minimum Dimmer level control'
            },
            14: {
                value: 2,
                name: 'Switch Type'
            },
            15: {
                value: 1,
                name: 'Double click option (set lighting at 100%)'
            },
            16: {
                value: 0,
                name: 'Saving device state after power failure'
            },
            17: {
                value: 0,
                name: 'The function of 3-way switch, provides the option to double key no. 1'
            },
            18: {
                value: 0,
                name: 'The function of synchronizing the light level for associated devices'
            },
            19: {
                value: 0,
                name: 'Assigns bistable key status to the device status'
            },
            20: {
                value: 110,
                name: 'The function enabling the change of control impulse length'
            },
            30: {
                value: 0,
                name: 'Alarm of any type (general alarm, water flooding alarm, smoke alarm: CO, CO2, temperature alarm)'
            },
            39: {
                value: 600,
                name: 'Active flashing alarm time'
            },
            40: {
                value: 99,
                name: 'Updating the dimming level without the input from the switch'
            },
            41: {
                value: 1,
                name: 'Scene activation functionality'
            }
        };
        
        UtilsHWDev.FGD211.super_.call(this, config);
    }
    
    inherits(UtilsHWDev.FGD211, UtilsHWDev.HWDev);
    
    
    
    
    
    
    

    return UtilsHWDev;
});
