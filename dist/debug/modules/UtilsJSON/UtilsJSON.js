/*
global config, inherits, controller, MHA
*/


define('UtilsJSON', ['AbstractModule'], function(AbstractModule) {

    function UtilsJSON(config) {
        UtilsJSON.super_.call(this, config);
    }

    inherits(UtilsJSON, AbstractModule);

    // UtilsJSON.stringify = function(obj, replacer, spaces, cycleReplacer) {
    //return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
    UtilsJSON.stringify = function(obj, replacer, spaces) {
        return JSON.stringify(obj, serializer(replacer), spaces);

        //function serializer(replacer, cycleReplacer) {
        function serializer(replacer) {
            var stack = [],
                keys = []

            //if (cycleReplacer == null) cycleReplacer = function(key, value) {
            var cycleReplacer = function(key, value) {
                if (stack[0] === value) return "[Circular ~]";
                return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
            }

            return function(key, value) {
                if (stack.length > 0) {
                    var thisPos = stack.indexOf(this);
                    ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
                    ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
                    if (~stack.indexOf(value))
                        value = cycleReplacer.call(this, key, value);
                }
                else
                    stack.push(value);

                return replacer == null ? value : replacer.call(this, key, value);
            }
        }
    }

    UtilsJSON.prototype.stop = function() {
        UtilsJSON.super_.prototype.stop.apply(this, arguments);
    };

    return UtilsJSON;
});
