define('WebServer', ['AbstractModule'], function(AbstractModule){

    /**
     * 
     * 
     * 
     * 
     */
    function WebServer(config) {
        WebServer.super_.call(this, config);
        // Call superconstructor first (ModuleBase)
        this.name = 'WebServer';
        this.log('construcror');
        
        this.panels = [];
        
        //this.log(JSON.stringify(config, '', 4));
        this._startWebServer();
    }
    
  
    inherits(WebServer, AbstractModule);
    
    WebServer.prototype.stop = function(){
        this._stopWebServer();
        WebServer.super_.prototype.stop.apply(this, arguments);
    }
    
    WebServer.prototype.addPanel = function(panel){
        this.panels.push(panel);
    };
    
    WebServer.prototype.removePanel = function(key){
      this.panels = this.panels.filter(function(panel){
          return panel.key != key;
      });
    };
    
    /**
     * route - строка, из которой потом сформируется RegExp 
     * заменяется :\w+ на (.+)
     * 
     * "/static/:path"              /static/assets/images/icon.png -> ["assets/images/icon.png"]
     * "/gal/:tag/:page\\?q=:ww"     /gal/1/2?q=w -> ["1", "2", "w"]
     * 
     */
    WebServer.prototype.addRoute = function(route, handler, scope){
        var obj = {
            pattern: new RegExp('^' + route.replace(/:\w+/g, '([\\s\\S]+)') + '$'),
            callback: scope ? handler.bind(scope) : handler
        } 
        this.routes.push(obj);
        this.log('addRoute: ' + obj.pattern);
        //this.routes[this.trimSlash(route)] = scope ? handler.bind(scope) : handler;
    };
    
    WebServer.prototype._startWebServer = function (){
    	this.routes = [];
    	
        // define global handler for HTTP requests
        mha = (function(url, request) {
            //this.log('request: ' + url);
            
        	var i = this.routes.length;
            while( i-- ){
               var args = url.match(this.routes[i].pattern);
               if( args ){
                    return this.routes[i].callback(args.slice(1));
               }
            }
        	
        	this.log('request: ' + url +' route not found');
		    return {
    		    status: 404
    		}
        }).bind(this);
        
        ws.allowExternalAccess("mha", controller.auth.ROLE.ANONYMOUS); // login required
    	
    	//this.addDefaultRoutes();
    	this._initRoutes();
    };
    
    WebServer.prototype._initRoutes = function(){
        // index
        this.addRoute('/', rootHandler, this);
    	this.addRoute('/index.html', rootHandler, this);
    	
    	function rootHandler(params){
    		this.log('get index: ' + JSON.stringify(params));
    		//return this.sendFile('modules/WebServer/htdocs/index.html');
    		return this.sendFile('htdocs/index.html');
    	}
    	
    	// root htdocs
    	this.addRoute('/htdocs/:path', function(args){
            return this.sendFile('htdocs/' + args[0]);
        }, this);
        
        // module htdocs
    	this.addRoute('/modules/:module/htdocs/:path', function(args){
            return this.sendFile('modules/' + args[0] + '/htdocs/' + args[1]);
        }, this);
        
        // WebServer Panels
        this.addRoute('/modules/'+this.name+'/api/panels', function(args){
    	    return this.sendJSON(this.panels);
    	   
    	}, this);
        
        
    };
    
    
   

    WebServer.prototype._getMimeType = function(path){
        var ext = path.split("/").pop().split(".").pop();
        return this._mimeTypes[ext] || 'application/octet-stream';
    }
    	
    	
    WebServer.prototype.sendFile = function(path){
        var root = MHA.fsRoot; //  'modules/MyHomeAutomation/';
        
        //this.log('sendFile: ' + root + path);

        try {
        
            var contentType = this._getMimeType(path);
            
            var data = fs.load(root + path);
            
            try{
            data = decodeURIComponent(escape(data));
            } catch(err) {}
            
            var result = {
                status: 200,
                headers: {
                    "Content-Type": contentType,
			        "Connection": "keep-alive"
                },
                body: data
            }
            return result;
        
        } catch(err) {
            this.log('sendFile Error (' + path + '): ' + err.toString());
            return this.sendError(500, err.toString() + "\n" + err.stack);
        }
        
    };
    
    WebServer.prototype.sendError = function(status, body){
        return {
            status: status,
            headers: {
                "Content-Type": "text/plain",
                "Connection": "keep-alive"
            },
            body: body
        }
    };
    
    WebServer.prototype.sendJSON = function(data){
        return {
            status: 200,
            headers: {
                "Content-Type": 'application/json',
		        "Connection": "keep-alive"
            },
            body: data
        }
    };
    	
    WebServer.prototype._stopWebServer = function (){
    	ws.revokeExternalAccess("mha");
        mha = null;
    };
    
    
    
    WebServer.prototype._mimeTypes = {
        "ez": "application/andrew-inset",
        "aw": "application/applixware",
        "atom": "application/atom+xml",
        "atomcat": "application/atomcat+xml",
        "atomsvc": "application/atomsvc+xml",
        "ccxml": "application/ccxml+xml",
        "cu": "application/cu-seeme",
        "davmount": "application/davmount+xml",
        "ecma": "application/ecmascript",
        "emma": "application/emma+xml",
        "epub": "application/epub+zip",
        "pfr": "application/font-tdpfr",
        "stk": "application/hyperstudio",
        "jar": "application/java-archive",
        "ser": "application/java-serialized-object",
        "class": "application/java-vm",
        "js": "application/javascript",
        "json": "application/json",
        "lostxml": "application/lost+xml",
        "hqx": "application/mac-binhex40",
        "cpt": "application/mac-compactpro",
        "mrc": "application/marc",
        "mathml": "application/mathml+xml",
        "mbox": "application/mbox",
        "mscml": "application/mediaservercontrol+xml",
        "mp4s": "application/mp4",
        "doc": "application/msword",
        "dot": "application/msword",
        "mxf": "application/mxf",
        "oda": "application/oda",
        "opf": "application/oebps-package+xml",
        "ogx": "application/ogg",
        "xer": "application/patch-ops-error+xml",
        "pdf": "application/pdf",
        "pgp": "application/pgp-encrypted",
        "prf": "application/pics-rules",
        "p10": "application/pkcs10",
        "p7s": "application/pkcs7-signature",
        "cer": "application/pkix-cert",
        "crl": "application/pkix-crl",
        "pkipath": "application/pkix-pkipath",
        "pki": "application/pkixcmp",
        "pls": "application/pls+xml",
        "cww": "application/prs.cww",
        "rdf": "application/rdf+xml",
        "rif": "application/reginfo+xml",
        "rnc": "application/relax-ng-compact-syntax",
        "rl": "application/resource-lists+xml",
        "rld": "application/resource-lists-diff+xml",
        "rs": "application/rls-services+xml",
        "rsd": "application/rsd+xml",
        "rss": "application/rss+xml",
        "rtf": "application/rtf",
        "sbml": "application/sbml+xml",
        "scq": "application/scvp-cv-request",
        "scs": "application/scvp-cv-response",
        "spq": "application/scvp-vp-request",
        "spp": "application/scvp-vp-response",
        "sdp": "application/sdp",
        "setpay": "application/set-payment-initiation",
        "setreg": "application/set-registration-initiation",
        "shf": "application/shf+xml",
        "rq": "application/sparql-query",
        "srx": "application/sparql-results+xml",
        "gram": "application/srgs",
        "grxml": "application/srgs+xml",
        "ssml": "application/ssml+xml",
        "plb": "application/vnd.3gpp.pic-bw-large",
        "psb": "application/vnd.3gpp.pic-bw-small",
        "pvb": "application/vnd.3gpp.pic-bw-var",
        "tcap": "application/vnd.3gpp2.tcap",
        "pwn": "application/vnd.3m.post-it-notes",
        "aso": "application/vnd.accpac.simply.aso",
        "imp": "application/vnd.accpac.simply.imp",
        "acu": "application/vnd.acucobol",
        "air": "application/vnd.adobe.air-application-installer-package+zip",
        "xdp": "application/vnd.adobe.xdp+xml",
        "xfdf": "application/vnd.adobe.xfdf",
        "azf": "application/vnd.airzip.filesecure.azf",
        "azs": "application/vnd.airzip.filesecure.azs",
        "azw": "application/vnd.amazon.ebook",
        "acc": "application/vnd.americandynamics.acc",
        "ami": "application/vnd.amiga.ami",
        "apk": "application/vnd.android.package-archive",
        "cii": "application/vnd.anser-web-certificate-issue-initiation",
        "fti": "application/vnd.anser-web-funds-transfer-initiation",
        "atx": "application/vnd.antix.game-component",
        "mpkg": "application/vnd.apple.installer+xml",
        "swi": "application/vnd.arastra.swi",
        "aep": "application/vnd.audiograph",
        "mpm": "application/vnd.blueice.multipass",
        "bmi": "application/vnd.bmi",
        "rep": "application/vnd.businessobjects",
        "cdxml": "application/vnd.chemdraw+xml",
        "mmd": "application/vnd.chipnuts.karaoke-mmd",
        "cdy": "application/vnd.cinderella",
        "cla": "application/vnd.claymore",
        "csp": "application/vnd.commonspace",
        "cdbcmsg": "application/vnd.contact.cmsg",
        "cmc": "application/vnd.cosmocaller",
        "clkx": "application/vnd.crick.clicker",
        "clkk": "application/vnd.crick.clicker.keyboard",
        "clkp": "application/vnd.crick.clicker.palette",
        "clkt": "application/vnd.crick.clicker.template",
        "clkw": "application/vnd.crick.clicker.wordbank",
        "wbs": "application/vnd.criticaltools.wbs+xml",
        "pml": "application/vnd.ctc-posml",
        "ppd": "application/vnd.cups-ppd",
        "car": "application/vnd.curl.car",
        "pcurl": "application/vnd.curl.pcurl",
        "rdz": "application/vnd.data-vision.rdz",
        "fe_launch": "application/vnd.denovo.fcselayout-link",
        "dna": "application/vnd.dna",
        "mlp": "application/vnd.dolby.mlp",
        "dpg": "application/vnd.dpgraph",
        "dfac": "application/vnd.dreamfactory",
        "geo": "application/vnd.dynageo",
        "mag": "application/vnd.ecowin.chart",
        "nml": "application/vnd.enliven",
        "esf": "application/vnd.epson.esf",
        "msf": "application/vnd.epson.msf",
        "qam": "application/vnd.epson.quickanime",
        "slt": "application/vnd.epson.salt",
        "ssf": "application/vnd.epson.ssf",
        "ez2": "application/vnd.ezpix-album",
        "ez3": "application/vnd.ezpix-package",
        "fdf": "application/vnd.fdf",
        "mseed": "application/vnd.fdsn.mseed",
        "gph": "application/vnd.flographit",
        "ftc": "application/vnd.fluxtime.clip",
        "fnc": "application/vnd.frogans.fnc",
        "ltf": "application/vnd.frogans.ltf",
        "fsc": "application/vnd.fsc.weblaunch",
        "oas": "application/vnd.fujitsu.oasys",
        "oa2": "application/vnd.fujitsu.oasys2",
        "oa3": "application/vnd.fujitsu.oasys3",
        "fg5": "application/vnd.fujitsu.oasysgp",
        "bh2": "application/vnd.fujitsu.oasysprs",
        "ddd": "application/vnd.fujixerox.ddd",
        "xdw": "application/vnd.fujixerox.docuworks",
        "xbd": "application/vnd.fujixerox.docuworks.binder",
        "fzs": "application/vnd.fuzzysheet",
        "txd": "application/vnd.genomatix.tuxedo",
        "ggb": "application/vnd.geogebra.file",
        "ggt": "application/vnd.geogebra.tool",
        "gmx": "application/vnd.gmx",
        "kml": "application/vnd.google-earth.kml+xml",
        "kmz": "application/vnd.google-earth.kmz",
        "gac": "application/vnd.groove-account",
        "ghf": "application/vnd.groove-help",
        "gim": "application/vnd.groove-identity-message",
        "grv": "application/vnd.groove-injector",
        "gtm": "application/vnd.groove-tool-message",
        "tpl": "application/vnd.groove-tool-template",
        "vcg": "application/vnd.groove-vcard",
        "zmm": "application/vnd.handheld-entertainment+xml",
        "hbci": "application/vnd.hbci",
        "les": "application/vnd.hhe.lesson-player",
        "hpgl": "application/vnd.hp-hpgl",
        "hpid": "application/vnd.hp-hpid",
        "hps": "application/vnd.hp-hps",
        "jlt": "application/vnd.hp-jlyt",
        "pcl": "application/vnd.hp-pcl",
        "pclxl": "application/vnd.hp-pclxl",
        "sfd-hdstx": "application/vnd.hydrostatix.sof-data",
        "x3d": "application/vnd.hzn-3d-crossword",
        "mpy": "application/vnd.ibm.minipay",
        "irm": "application/vnd.ibm.rights-management",
        "sc": "application/vnd.ibm.secure-container",
        "igl": "application/vnd.igloader",
        "ivp": "application/vnd.immervision-ivp",
        "ivu": "application/vnd.immervision-ivu",
        "qbo": "application/vnd.intu.qbo",
        "qfx": "application/vnd.intu.qfx",
        "rcprofile": "application/vnd.ipunplugged.rcprofile",
        "irp": "application/vnd.irepository.package+xml",
        "xpr": "application/vnd.is-xpr",
        "jam": "application/vnd.jam",
        "rms": "application/vnd.jcp.javame.midlet-rms",
        "jisp": "application/vnd.jisp",
        "joda": "application/vnd.joost.joda-archive",
        "karbon": "application/vnd.kde.karbon",
        "chrt": "application/vnd.kde.kchart",
        "kfo": "application/vnd.kde.kformula",
        "flw": "application/vnd.kde.kivio",
        "kon": "application/vnd.kde.kontour",
        "ksp": "application/vnd.kde.kspread",
        "htke": "application/vnd.kenameaapp",
        "kia": "application/vnd.kidspiration",
        "sse": "application/vnd.kodak-descriptor",
        "lbd": "application/vnd.llamagraphics.life-balance.desktop",
        "lbe": "application/vnd.llamagraphics.life-balance.exchange+xml",
        "123": "application/vnd.lotus-1-2-3",
        "apr": "application/vnd.lotus-approach",
        "pre": "application/vnd.lotus-freelance",
        "nsf": "application/vnd.lotus-notes",
        "org": "application/vnd.lotus-organizer",
        "scm": "application/vnd.lotus-screencam",
        "lwp": "application/vnd.lotus-wordpro",
        "portpkg": "application/vnd.macports.portpkg",
        "mcd": "application/vnd.mcd",
        "mc1": "application/vnd.medcalcdata",
        "cdkey": "application/vnd.mediastation.cdkey",
        "mwf": "application/vnd.mfer",
        "mfm": "application/vnd.mfmp",
        "flo": "application/vnd.micrografx.flo",
        "igx": "application/vnd.micrografx.igx",
        "mif": "application/vnd.mif",
        "daf": "application/vnd.mobius.daf",
        "dis": "application/vnd.mobius.dis",
        "mbk": "application/vnd.mobius.mbk",
        "mqy": "application/vnd.mobius.mqy",
        "msl": "application/vnd.mobius.msl",
        "plc": "application/vnd.mobius.plc",
        "txf": "application/vnd.mobius.txf",
        "mpn": "application/vnd.mophun.application",
        "mpc": "application/vnd.mophun.certificate",
        "xul": "application/vnd.mozilla.xul+xml",
        "cil": "application/vnd.ms-artgalry",
        "cab": "application/vnd.ms-cab-compressed",
        "xls": "application/vnd.ms-excel",
        "xlm": "application/vnd.ms-excel",
        "xla": "application/vnd.ms-excel",
        "xlc": "application/vnd.ms-excel",
        "xlt": "application/vnd.ms-excel",
        "xlw": "application/vnd.ms-excel",
        "xlam": "application/vnd.ms-excel.addin.macroenabled.12",
        "xlsb": "application/vnd.ms-excel.sheet.binary.macroenabled.12",
        "xlsm": "application/vnd.ms-excel.sheet.macroenabled.12",
        "xltm": "application/vnd.ms-excel.template.macroenabled.12",
        "eot": "application/vnd.ms-fontobject",
        "chm": "application/vnd.ms-htmlhelp",
        "ims": "application/vnd.ms-ims",
        "lrm": "application/vnd.ms-lrm",
        "cat": "application/vnd.ms-pki.seccat",
        "stl": "application/vnd.ms-pki.stl",
        "ppam": "application/vnd.ms-powerpoint.addin.macroenabled.12",
        "pptm": "application/vnd.ms-powerpoint.presentation.macroenabled.12",
        "sldm": "application/vnd.ms-powerpoint.slide.macroenabled.12",
        "ppsm": "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
        "potm": "application/vnd.ms-powerpoint.template.macroenabled.12",
        "docm": "application/vnd.ms-word.document.macroenabled.12",
        "dotm": "application/vnd.ms-word.template.macroenabled.12",
        "wpl": "application/vnd.ms-wpl",
        "xps": "application/vnd.ms-xpsdocument",
        "mseq": "application/vnd.mseq",
        "mus": "application/vnd.musician",
        "msty": "application/vnd.muvee.style",
        "nlu": "application/vnd.neurolanguage.nlu",
        "nnd": "application/vnd.noblenet-directory",
        "nns": "application/vnd.noblenet-sealer",
        "nnw": "application/vnd.noblenet-web",
        "ngdat": "application/vnd.nokia.n-gage.data",
        "n-gage": "application/vnd.nokia.n-gage.symbian.install",
        "rpst": "application/vnd.nokia.radio-preset",
        "rpss": "application/vnd.nokia.radio-presets",
        "edm": "application/vnd.novadigm.edm",
        "edx": "application/vnd.novadigm.edx",
        "ext": "application/vnd.novadigm.ext",
        "odc": "application/vnd.oasis.opendocument.chart",
        "otc": "application/vnd.oasis.opendocument.chart-template",
        "odb": "application/vnd.oasis.opendocument.database",
        "odf": "application/vnd.oasis.opendocument.formula",
        "odft": "application/vnd.oasis.opendocument.formula-template",
        "odg": "application/vnd.oasis.opendocument.graphics",
        "otg": "application/vnd.oasis.opendocument.graphics-template",
        "odi": "application/vnd.oasis.opendocument.image",
        "oti": "application/vnd.oasis.opendocument.image-template",
        "odp": "application/vnd.oasis.opendocument.presentation",
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "ots": "application/vnd.oasis.opendocument.spreadsheet-template",
        "odt": "application/vnd.oasis.opendocument.text",
        "otm": "application/vnd.oasis.opendocument.text-master",
        "ott": "application/vnd.oasis.opendocument.text-template",
        "oth": "application/vnd.oasis.opendocument.text-web",
        "xo": "application/vnd.olpc-sugar",
        "dd2": "application/vnd.oma.dd2+xml",
        "oxt": "application/vnd.openofficeorg.extension",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
        "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
        "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
        "dp": "application/vnd.osgi.dp",
        "str": "application/vnd.pg.format",
        "ei6": "application/vnd.pg.osasli",
        "efif": "application/vnd.picsel",
        "plf": "application/vnd.pocketlearn",
        "pbd": "application/vnd.powerbuilder6",
        "box": "application/vnd.previewsystems.box",
        "mgz": "application/vnd.proteus.magazine",
        "qps": "application/vnd.publishare-delta-tree",
        "ptid": "application/vnd.pvi.ptid1",
        "mxl": "application/vnd.recordare.musicxml",
        "musicxml": "application/vnd.recordare.musicxml+xml",
        "cod": "application/vnd.rim.cod",
        "rm": "application/vnd.rn-realmedia",
        "link66": "application/vnd.route66.link66+xml",
        "see": "application/vnd.seemail",
        "sema": "application/vnd.sema",
        "semd": "application/vnd.semd",
        "semf": "application/vnd.semf",
        "ifm": "application/vnd.shana.informed.formdata",
        "itp": "application/vnd.shana.informed.formtemplate",
        "iif": "application/vnd.shana.informed.interchange",
        "ipk": "application/vnd.shana.informed.package",
        "mmf": "application/vnd.smaf",
        "teacher": "application/vnd.smart.teacher",
        "dxp": "application/vnd.spotfire.dxp",
        "sfs": "application/vnd.spotfire.sfs",
        "sdc": "application/vnd.stardivision.calc",
        "sda": "application/vnd.stardivision.draw",
        "sdd": "application/vnd.stardivision.impress",
        "smf": "application/vnd.stardivision.math",
        "sdw": "application/vnd.stardivision.writer",
        "vor": "application/vnd.stardivision.writer",
        "sgl": "application/vnd.stardivision.writer-global",
        "sxc": "application/vnd.sun.xml.calc",
        "stc": "application/vnd.sun.xml.calc.template",
        "sxd": "application/vnd.sun.xml.draw",
        "std": "application/vnd.sun.xml.draw.template",
        "sxi": "application/vnd.sun.xml.impress",
        "sti": "application/vnd.sun.xml.impress.template",
        "sxm": "application/vnd.sun.xml.math",
        "sxw": "application/vnd.sun.xml.writer",
        "sxg": "application/vnd.sun.xml.writer.global",
        "stw": "application/vnd.sun.xml.writer.template",
        "svd": "application/vnd.svd",
        "xsm": "application/vnd.syncml+xml",
        "bdm": "application/vnd.syncml.dm+wbxml",
        "xdm": "application/vnd.syncml.dm+xml",
        "tao": "application/vnd.tao.intent-module-archive",
        "tmo": "application/vnd.tmobile-livetv",
        "tpt": "application/vnd.trid.tpt",
        "mxs": "application/vnd.triscape.mxs",
        "tra": "application/vnd.trueapp",
        "utz": "application/vnd.uiq.theme",
        "umj": "application/vnd.umajin",
        "unityweb": "application/vnd.unity",
        "uoml": "application/vnd.uoml+xml",
        "vcx": "application/vnd.vcx",
        "vis": "application/vnd.visionary",
        "vsf": "application/vnd.vsf",
        "wbxml": "application/vnd.wap.wbxml",
        "wmlc": "application/vnd.wap.wmlc",
        "wmlsc": "application/vnd.wap.wmlscriptc",
        "wtb": "application/vnd.webturbo",
        "wpd": "application/vnd.wordperfect",
        "wqd": "application/vnd.wqd",
        "stf": "application/vnd.wt.stf",
        "xar": "application/vnd.xara",
        "xfdl": "application/vnd.xfdl",
        "hvd": "application/vnd.yamaha.hv-dic",
        "hvs": "application/vnd.yamaha.hv-script",
        "hvp": "application/vnd.yamaha.hv-voice",
        "osf": "application/vnd.yamaha.openscoreformat",
        "osfpvg": "application/vnd.yamaha.openscoreformat.osfpvg+xml",
        "saf": "application/vnd.yamaha.smaf-audio",
        "spf": "application/vnd.yamaha.smaf-phrase",
        "cmp": "application/vnd.yellowriver-custom-menu",
        "zir,.zirz": "application/vnd.zul",
        "zaz": "application/vnd.zzazz.deck+xml",
        "vxml": "application/voicexml+xml",
        "hlp": "application/winhlp",
        "wsdl": "application/wsdl+xml",
        "wspolicy": "application/wspolicy+xml",
        "abw": "application/x-abiword",
        "ace": "application/x-ace-compressed",
        "aam": "application/x-authorware-map",
        "aas": "application/x-authorware-seg",
        "bcpio": "application/x-bcpio",
        "torrent": "application/x-bittorrent",
        "bz": "application/x-bzip",
        "vcd": "application/x-cdlink",
        "chat": "application/x-chat",
        "pgn": "application/x-chess-pgn",
        "cpio": "application/x-cpio",
        "csh": "application/x-csh",
        "wad": "application/x-doom",
        "ncx": "application/x-dtbncx+xml",
        "dtb": "application/x-dtbook+xml",
        "res": "application/x-dtbresource+xml",
        "dvi": "application/x-dvi",
        "bdf": "application/x-font-bdf",
        "gsf": "application/x-font-ghostscript",
        "psf": "application/x-font-linux-psf",
        "otf": "application/x-font-otf",
        "pcf": "application/x-font-pcf",
        "snf": "application/x-font-snf",
        "ttf,.ttc": "application/x-font-ttf",
        "woff": "application/font-woff",
        "spl": "application/x-futuresplash",
        "gnumeric": "application/x-gnumeric",
        "gtar": "application/x-gtar",
        "hdf": "application/x-hdf",
        "jnlp": "application/x-java-jnlp-file",
        "latex": "application/x-latex",
        "application": "application/x-ms-application",
        "wmd": "application/x-ms-wmd",
        "wmz": "application/x-ms-wmz",
        "xbap": "application/x-ms-xbap",
        "mdb": "application/x-msaccess",
        "obd": "application/x-msbinder",
        "crd": "application/x-mscardfile",
        "clp": "application/x-msclip",
        "wmf": "application/x-msmetafile",
        "mny": "application/x-msmoney",
        "pub": "application/x-mspublisher",
        "scd": "application/x-msschedule",
        "trm": "application/x-msterminal",
        "wri": "application/x-mswrite",
        "p7r": "application/x-pkcs7-certreqresp",
        "rar": "application/x-rar-compressed",
        "sh": "application/x-sh",
        "shar": "application/x-shar",
        "swf": "application/x-shockwave-flash",
        "xap": "application/x-silverlight-app",
        "sit": "application/x-stuffit",
        "sitx": "application/x-stuffitx",
        "sv4cpio": "application/x-sv4cpio",
        "sv4crc": "application/x-sv4crc",
        "tar": "application/x-tar",
        "tcl": "application/x-tcl",
        "tex": "application/x-tex",
        "tfm": "application/x-tex-tfm",
        "ustar": "application/x-ustar",
        "src": "application/x-wais-source",
        "fig": "application/x-xfig",
        "xpi": "application/x-xpinstall",
        "xenc": "application/xenc+xml",
        "xhtml": "application/xhtml+xml",
        "xht": "application/xhtml+xml",
        "xml": "application/xml",
        "xsl": "application/xml",
        "dtd": "application/xml-dtd",
        "xop": "application/xop+xml",
        "xslt": "application/xslt+xml",
        "xspf": "application/xspf+xml",
        "zip": "application/zip",
        "adp": "audio/adpcm",
        "mp4a": "audio/mp4",
        "eol": "audio/vnd.digital-winds",
        "dts": "audio/vnd.dts",
        "dtshd": "audio/vnd.dts.hd",
        "lvp": "audio/vnd.lucent.voice",
        "pya": "audio/vnd.ms-playready.media.pya",
        "ecelp4800": "audio/vnd.nuera.ecelp4800",
        "ecelp7470": "audio/vnd.nuera.ecelp7470",
        "ecelp9600": "audio/vnd.nuera.ecelp9600",
        "aac": "audio/x-aac",
        "m3u": "audio/x-mpegurl",
        "wax": "audio/x-ms-wax",
        "wma": "audio/x-ms-wma",
        "rmp": "audio/x-pn-realaudio-plugin",
        "wav": "audio/x-wav",
        "cdx": "chemical/x-cdx",
        "cif": "chemical/x-cif",
        "cmdf": "chemical/x-cmdf",
        "cml": "chemical/x-cml",
        "csml": "chemical/x-csml",
        "xyz": "chemical/x-xyz",
        "bmp": "image/bmp",
        "cgm": "image/cgm",
        "g3": "image/g3fax",
        "gif": "image/gif",
        "ief": "image/ief",
        "jp2": "image/jp2",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "jpe": "image/jpeg",
        "png": "image/png",
        "btif": "image/prs.btif",
        "svg": "image/svg+xml",
        "svgz": "image/svg+xml",
        "psd": "image/vnd.adobe.photoshop",
        "dwg": "image/vnd.dwg",
        "dxf": "image/vnd.dxf",
        "fbs": "image/vnd.fastbidsheet",
        "fpx": "image/vnd.fpx",
        "fst": "image/vnd.fst",
        "mmr": "image/vnd.fujixerox.edmics-mmr",
        "rlc": "image/vnd.fujixerox.edmics-rlc",
        "mdi": "image/vnd.ms-modi",
        "npx": "image/vnd.net-fpx",
        "wbmp": "image/vnd.wap.wbmp",
        "xif": "image/vnd.xiff",
        "ras": "image/x-cmu-raster",
        "cmx": "image/x-cmx",
        "ico": "image/x-icon",
        "pnm": "image/x-portable-anymap",
        "pbm": "image/x-portable-bitmap",
        "pgm": "image/x-portable-graymap",
        "ppm": "image/x-portable-pixmap",
        "rgb": "image/x-rgb",
        "xbm": "image/x-xbitmap",
        "xpm": "image/x-xpixmap",
        "xwd": "image/x-xwindowdump",
        "gdl": "model/vnd.gdl",
        "gtw": "model/vnd.gtw",
        "mts": "model/vnd.mts",
        "vtu": "model/vnd.vtu",
        "css": "text/css",
        "csv": "text/csv",
        "html": "text/html",
        "htm": "text/html",
        "txt": "text/plain",
        "text": "text/plain",
        "conf": "text/plain",
        "def": "text/plain",
        "log": "text/plain",
        "dsc": "text/prs.lines.tag",
        "rtx": "text/richtext",
        "tsv": "text/tab-separated-values",
        "curl": "text/vnd.curl",
        "dcurl": "text/vnd.curl.dcurl",
        "scurl": "text/vnd.curl.scurl",
        "mcurl": "text/vnd.curl.mcurl",
        "fly": "text/vnd.fly",
        "flx": "text/vnd.fmi.flexstor",
        "gv": "text/vnd.graphviz",
        "3dml": "text/vnd.in3d.3dml",
        "spot": "text/vnd.in3d.spot",
        "jad": "text/vnd.sun.j2me.app-descriptor",
        "wml": "text/vnd.wap.wml",
        "wmls": "text/vnd.wap.wmlscript",
        "java": "text/x-java-source",
        "etx": "text/x-setext",
        "uu": "text/x-uuencode",
        "vcs": "text/x-vcalendar",
        "vcf": "text/x-vcard",
        "3gp": "video/3gpp",
        "3g2": "video/3gpp2",
        "h261": "video/h261",
        "h263": "video/h263",
        "h264": "video/h264",
        "jpgv": "video/jpeg",
        "mp4": "video/mp4",
        "mp4v": "video/mp4",
        "mpg4": "video/mp4",
        "webm": "video/webm",
        "mpeg": "video/mpeg",
        "mpg": "video/mpeg",
        "mpe": "video/mpeg",
        "m1v": "video/mpeg",
        "m2v": "video/mpeg",
        "ogv": "video/ogg",
        "fvt": "video/vnd.fvt",
        "pyv": "video/vnd.ms-playready.media.pyv",
        "viv": "video/vnd.vivo",
        "f4v": "video/x-f4v",
        "fli": "video/x-fli",
        "flv": "video/x-flv",
        "wm": "video/x-ms-wm",
        "wmv": "video/x-ms-wmv",
        "wmx": "video/x-ms-wmx",
        "wvx": "video/x-ms-wvx",
        "avi": "video/x-msvideo",
        "movie": "video/x-sgi-movie",
        "ice": "x-conference/x-cooltalk",
        "indd": "application/x-indesign",
        "dat": "application/octet-stream",
        "gz": "application/x-gzip",
        "tgz": "application/x-tar",
        "tar": "application/x-tar",
        "epub": "application/epub+zip",
        "mobi": "application/x-mobipocket-ebook",
        "README": "text/plain",
        "LICENSE": "text/plain",
        "COPYING": "text/plain",
        "TODO": "text/plain",
        "ABOUT": "text/plain",
        "AUTHORS": "text/plain",
        "CONTRIBUTORS": "text/plain"

    };
    
    return new WebServer(config);
    
});

