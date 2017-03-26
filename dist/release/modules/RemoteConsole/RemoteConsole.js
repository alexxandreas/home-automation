/*
global config, inherits, controller, MHA
*/
define('RemoteConsole', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
   
   function RemoteConsole(config) {
        RemoteConsole.super_.call(this, config);
        this.name = 'RemoteConsole';
        this.log('construcror');

        this._initFrontend();
    }

    inherits(RemoteConsole, AbstractModule);


    RemoteConsole.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/eval/:code', function(args){
	        var code = args[0];
	        
	        try {
	            var result = eval(code);
	            return ws.sendJSON(result);
	        } catch (err){
	            return ws.sendError(500, {text: err.toString(), stack: err.stack});
	        }
	       
	        //return ws.sendJSON(data);
    	}, this);
    	
    	
    	
    	WebServer.addPanel({
            title:'Remote Console',
            template: '/views/RemoteConsole/htdocs/RemoteConsole.html'
        });
    };
    
    
    RemoteConsole.prototype.stop = function(){
        RemoteConsole.super_.prototype.stop.apply(this, arguments);
    };

    return new RemoteConsole(config);

});

