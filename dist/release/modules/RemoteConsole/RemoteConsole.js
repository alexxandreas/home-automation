/*
global config, inherits, controller, MHA
*/
define('RemoteConsole', ['AbstractModule', 'WebServer', 'UtilsJSON'], function(AbstractModule, WebServer, UtilsJSON) {

    function RemoteConsole(config) {
        RemoteConsole.super_.call(this, config);
        this.name = 'RemoteConsole';
        this.log('construcror');

        this.history = [];
        this._initFrontend();
    }

    inherits(RemoteConsole, AbstractModule);


    RemoteConsole.prototype._initFrontend = function() {
        var ws = WebServer;

        //var history = [];
        try {
            this.history = this.loadData('history') || [];
        }
        catch (err) {}


        ws.addRoute('/modules/' + this.name + '/api/eval/:code', function(args) {
            var code = args[0];
            code = decodeURIComponent(code);
            try {
                //addToHistory(code);
                var result = eval(code);
                if (result === undefined)
                    result = 'undefined';

                result = UtilsJSON.stringify(result);

                this.addToHistory(code, result);
                return ws.sendJSON(result);
            }
            catch (err) {
                var errObj = {
                    text: err.toString(),
                    stack: err.stack.replace('\\n', '\n')
                };

                this.addToHistory(code, errObj);
                return ws.sendError(500, errObj);
            }
        }, this);

        ws.addRoute('/modules/' + this.name + '/api/history', function(args) {
            try {
                return ws.sendJSON(this.history);
            }
            catch (err) {
                return ws.sendError(500, {
                    text: err.toString(),
                    stack: err.stack.replace('\\n', '\n')
                });
            }
        }, this);



        WebServer.addPanel({
            key: this.name,
            title: 'Remote Console',
            template: '/views/RemoteConsole/htdocs/RemoteConsole.html'
        });
    };

    RemoteConsole.prototype.addToHistory = function(src, data) {
        try {
            //var result = JSON.stringify(data, null, '  ').substr(0, 1000);
            if (typeof data != 'string')
                data = UtilsJSON.stringify(data, null, '  ');
            data = data.substr(0, 1000);
            //history.push(code);
            this.history.push({
                src: src,
                result: data
            });
            while (this.history.length > 50) {
                this.history.shift();
            }
            this.saveData('history', this.history);
        }
        catch (err) {
            this.log('Error in addToHistory: ' + err.toString() + ' ' + err.stack.replace('\\n', '\n'));
        }
    };

    RemoteConsole.prototype.stop = function() {
        WebServer.removePanel(this.name);
        RemoteConsole.super_.prototype.stop.apply(this, arguments);
    };

    return new RemoteConsole(config);

});
