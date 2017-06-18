/*
global config, inherits, controller, MHA, zway
*/

define('UtilsHWDev', ['AbstractModule'], function(AbstractModule) {

    function UtilsHWDev(config) {
        UtilsHWDev.super_.call(this, config);
    }

    inherits(UtilsHWDev, AbstractModule);

   
    
    

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
        this.configParams = [];
        Object.keys(this.defaultConfigParams).forEach(function(key){
            var value;
            if (config.configParams)
                value = config.configParams[key];
            if (value === undefined) 
                value = this.defaultConfigParams[key].value;
            
            if (value == null) return;
            
            this.configParams.push({
                paramId: key,
                configValue: value
            })
        }, this);
        
        this.id = config.id
        
        // установка wake up interval
        // https://zway.alexandreas.ru/ZWaveAPI/Run/devices[18].instances[0].commandClasses[0x84].Set(60,1)
    };
    
    UtilsHWDev.HWDev.prototype.log = function(data) {
        return MHA.prefixLog('HWDev(' + this.id + ')', data);
    };
    
    UtilsHWDev.HWDev.prototype.setId = function(id) {
        this.id = id;
    };
    
    UtilsHWDev.HWDev.prototype.getConfigParam = function(paramId, callback) {
        var self = this;
        try {
            zway.devices[this.id].instances[0].commandClasses[112].Get(paramId, function(){
                var newValue = self._getParam(paramId);
                callback.call(self, newValue, true);
            }, function(){
                var newValue = self._getParam(paramId);
                callback.call(self, newValue, false);
            })
        } catch (err) {
            callback.call(self, null, false);  
        }
    };
    
    UtilsHWDev.HWDev.prototype.setConfigParam = function(paramId, value, callback) {
        var self = this;
        try {
            zway.devices[this.id].instances[0].commandClasses[112].Set(paramId, value, 0, function(){
                self.getConfigParam.call(self, paramId, function(value, isError){
                    callback.call(self, value, true);
                })
            }, function(){
                self.getConfigParam.call(self, paramId, function(value, isError){
                    callback.call(self, value, false);
                })
            })
        } catch (err) {
            callback.call(self, null, false);  
        }
    };
    
    UtilsHWDev.HWDev.prototype._getParam = function(paramId){
        try {
            return zway.devices[this.id].instances[0].commandClasses[112].data[paramId].val.value;
        } catch (err) {
            return null;
        }
    };
    
    UtilsHWDev.HWDev.prototype.applyConfigParams = function() {
        if (this.id == null) return;
        this.log('applyConfigParams(' + this.id + ')');
        
        if (!this.configParams.length) return;
        
        var configParamsIndex = 0;
        var currentParam;
        
        applyNext.call(this);
        
        function applyNext(){
            if (configParamsIndex >= this.configParams.length) return;
            currentParam = this.configParams[configParamsIndex]
            configParamsIndex++;
            this.log('applyNext(' + currentParam.paramId + '): value -> ' + currentParam.configValue);
            this.getConfigParam(currentParam.paramId, getCallback);
        }
        
        function getCallback(value, isError) {
            if (value == currentParam.configValue) {
                // проверка прошла - проверяем дальше
                this.log('getCallback(' + currentParam.paramId + '): value ' + value + ' success');
                applyNext.call(this);
            } else {
                // проверка не прошла
                this.log('getCallback(' + currentParam.paramId + '): value ' + value + ', configValue ' + currentParam.configValue + (isError ? ' error' : ''));
                this.setConfigParam(currentParam.paramId, currentParam.configValue, setCallback);
            }
        }
        
        function setCallback(value, isError) {
            if (value == currentParam.configValue) {
                // проверка прошла - проверяем дальше
                this.log('setCallback(' + currentParam.paramId + '): value ' + value + ' success');
                applyNext.call(this);
            } else {
                // проверка не прошла
                this.log('setCallback(' + currentParam.paramId + '): value ' + value + ', configValue ' + currentParam.configValue + (isError ? ' error' : ''));
                setTimeout(applyNext.bind(this), 1000);
                //applyNext.call(this);
            }
        }
    
    };
    
    
    
    

    /**********************************************************/
    /************************* FGD211 *************************/
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
                value: 3,
                name: 'Time of manually moving the Dimmer between the extreme dimming values (in 10 ms)'
            },
            10: {
                value: 1, 
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
    
    
    
    /**********************************************************/
    /*********************** FGRGBWM441 ***********************/
    /**********************************************************/

    UtilsHWDev.FGRGBWM441 = function(config){
        
        
        this.defaultConfigParams = {
            1: {
                value: 0,
                name: 'ALL ON / ALL OFF'
            },
            6: {
                value: 0,
                name: 'Associations command class choice'
            },
            8: {
                value: 0,
                name: 'Outputs state change mode'
            },
            9: {
                value: 1,
                name: 'Step value (relevant for MODE1)'
            },
            10: {
                value: 10,
                name: 'Time between steps (relevant for MODE1)'
            },
            11: {
                value: 67,
                name: 'Time for changing from start to end value'
            },
            12: {
                value: 255,
                name: 'Maximum brightening level'
            },
            13: {
                value: 2,
                name: 'Minimum dim level'
            },
            14: {
                // value: 4369,
                name: 'Inputs/Outputs configuration'
            },
            16: {
                value: 0,
                name: 'Memorize device status at power cut. Device will be set to status memorized before power cut'
            },
            30: {
                value: 0,
                name: 'Alarm of any type (general alarm, flood alarm, smoke alarm: CO, CO2, temperature alarm)'
            },
            38: {
                value: 10,
                name: 'Alarm sequence program'
            },
            39: {
                value: 600,
                name: 'Active PROGRAM alarm time'
            },
            42: {
                value: 0,
                name: 'Command class reporting Outputs status change'
            },
            43: {
                value: 5,
                name: 'Reporting 0-10v analog inputs change threshold'
            },
            44: {
                value: 0,
                name: 'Power load reporting frequency'
            },
            45: {
                value: 0,
                name: 'Reporting changes in energy consumed by controlled devices'
            },
            71: {
                value: 1,
                name: 'Response to BRIGHTNESS set to 0%'
            },
            72: {
                value: 1,
                name: 'Starting predefined program when device set to work in RGB/RGBW mode (parameter 14) - relevant for main controllers other than Home Center 2 only'
            },
            73: {
                value: 0,
                name: 'Triple click action'
            }
        };
        
        UtilsHWDev.FGRGBWM441.super_.call(this, config);
    }
    
    inherits(UtilsHWDev.FGRGBWM441, UtilsHWDev.HWDev);
    
    
    
    /**********************************************************/
    /************************* FGMS001 ************************/
    /**********************************************************/

    UtilsHWDev.FGMS001 = function(config){
        
        this.defaultConfigParams = {
            1: {
                value: 10,
                name: 'SENSITIVITY'
            },
            2: {
                value: 10,
                name: 'BLIND TIME (INSENSITIVITY)'
            },
            3: {
                value: 1,
                name: 'PULSE COUNTER'
            },
            4: {
                value: 2,
                name: 'WINDOW TIME'
            },
            6: {
                value: 15,
                name: 'MOTION ALARM CANCELLATION DELAY'
            },
            8: {
                value: 0,
                name: 'PIR SENSOR OPERATING MODE'
            },
            9: {
                value: 200,
                name: 'NIGHT / DAY'
            },
            12: {
                value: 0,
                name: 'BASIC COMMAND CLASS FRAMES CONFIGURATION'
            },
            14: {
                value: 255,
                name: 'BASIC ON command frame value'
            },
            16: {
                value: 0,
                name: 'BASIC OFF command frame value'
            },
            20: {
                value: 15,
                name: 'TAMPER SENSITIVITY'
            },
            22: {
                value: 30,
                name: 'TAMPER ALARM CANCELLATION DELAY'
            },
            24: {
                value: 0,
                name: 'TAMPER OPERATING MODES'
            },
            25: {
                //value: ,
                name: 'TAMPER CANCELLATION REPORTS'
            },
            28: {
                //value: 0,
                name: 'TAMPER ALARM BROADCAST MODE - 3rd Group'
            },
            29: {
                //value: ,
                name: 'TAMPER ALARM BROADCAST MODE - 5th Group'
            },
            40: {
                value: 50,
                name: 'ILLUMINATION REPORT THRESHOLD'
            },
            42: {
                value: 500,
                name: 'ILLUMINATION REPORTS INTERVAL'
            },
            60: {
                value: 5,
                name: 'TEMPERATURE REPORT THRESHOLD'
            },
            62: {
                value: 60,
                name: 'INTERVAL OF TEMPERATURE MEASURING'
            },
            64: {
                value: 300,
                name: 'TEMPERATURE REPORTS INTERVAL'
            },
            66: {
                value: 0,
                name: 'TEMPERATURE OFFSET'
            },
            80: {
                value: 10,
                name: 'LED SIGNALING MODE'
            },
            81: {
                value: 0,
                name: 'LED BRIGHTNESS'
            },
            82: {
                value: 100,
                name: 'AMBIENT ILLUMINATION LEVEL BELOW WHICH LED BRIGHTNESS IS SET TO 1%'
            },
            83: {
                value: 1000,
                name: 'AMBIENT ILLUMINATION LEVEL ABOVE WHICH LED BRIGHTNESS IS SET TO 100%'
            },
            86: {
                value: 18,
                name: 'MINIMUM TEMPERATURE RESULTING IN BLUE LED ILLUMINATION'
            },
            87: {
                value: 28,
                name: 'MAXIMUM TEMPERATURE RESULTING IN RED LED ILLUMINATION'
            },
            89: {
                value: 1,
                name: 'LED INDICATING TAMPER ALARM'
            }
        };
        
        UtilsHWDev.FGMS001.super_.call(this, config);
    }
    
    inherits(UtilsHWDev.FGMS001, UtilsHWDev.HWDev);
    
    
    

    /**********************************************************/
    /************************** AEONMS ************************/
    /**********************************************************/

    UtilsHWDev.AEONMS = function(config){
        
        
        this.defaultConfigParams = {
            2: {
                value: 1,
                name: 'Wake up 10 minutes when batteries are inserted'
            },
            3: {
                value: 15,
                name: 'On time'
            },
            4: {
                value: 1,
                name: 'Enable motion sensor'
            },
            5: {
                //value: 1,
                name: 'Which command would be sent when the motion sensor triggered'
            },
            40: {
                //value: 0,
                name: 'Enable/disable the selective reporting only when measurements reach a certain threshold or percentage set in 41‐44 below'
            },
            41: {
                //value: ,
                name: 'Threshold change in temperature to induce an automatic report'
            },
            42: {
                //value: ,
                name: 'Threshold change in humidity to induce an automatic report'
            },
            43: {
                //value: ,
                name: 'Threshold change in luminance to induce an automatic report.'
            },
            44: {
                //value: ,
                name: 'Threshold change in battery level to induce an automatic report'
            },
            46: {
                //value: 0,
                name: 'Enable/disable to send the alarm report of low temperature(<‐15°C)'
            },
            101: {
                value: 254,
                name: 'Which report needs to be sent in Report group 1'
            },
            102: {
                //value: 0,
                name: 'Which report needs to be sent in Report group 2'
            },
            103: {
                //value: 0,
                name: 'Which report needs to be sent in Report group 3'
            },
            111: {
                value: 30,
                name: 'The interval time of sending reports in Report group 1'
            },
            112: {
                value: 720,
                name: 'The interval time of sending reports in Report group 2'
            },
            113: {
                value: 720,
                name: 'The interval time of sending reports in Report group 3'
            },
            252: {
                //value: 0,
                name: 'Enable/disable Configuration Locked'
            },
            255: {
                //value: ,
                name: 'Reset to factory default setting and removed from the z‐ wave network'
            }
        };
        
        UtilsHWDev.AEONMS.super_.call(this, config);
    }
    
    inherits(UtilsHWDev.AEONMS, UtilsHWDev.HWDev);
    
    
    
    /**********************************************************/
    /************************** TZ66D *************************/
    /**********************************************************/

    UtilsHWDev.TZ66D = function(config){
        
        
        this.defaultConfigParams = {
            // 1: {
            //     value: 0,
            //     name: 'Activate / deactivate functions ALL ON / ALL OFF'
            //     //def: 255,
            // }
        };
        
        UtilsHWDev.TZ66D.super_.call(this, config);
    }
    
    inherits(UtilsHWDev.TZ66D, UtilsHWDev.HWDev);
    
    
    

    return UtilsHWDev;
});
// 