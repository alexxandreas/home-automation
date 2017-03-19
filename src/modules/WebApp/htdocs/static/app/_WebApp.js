angular
	.module('WebApp', [
		'ngMaterial',
		'mdDataTable',
		'Views'
	])
	/*.config(function($mdIconProvider) {
		$mdIconProvider
			.defaultIconSet('img/icons/sets/core-icons.svg', 24);
	});*/
	.config(function($mdIconProvider) {
		//$mdIconProvider.defaultFontSet('md', 'material-icons');
		//$mdIconProvider.fontSet('md', 'material-icons');
		$mdIconProvider.defaultIconSet('static/core-icons.svg', 24);
		//$mdIconProvider.fontSet('md', 'Material Icons')
		//	.defaultFontSet( 'md' );
		//$mdIconProvider.iconSet('social', 'img/icons/sets/social-icons.svg', 24);
		//$mdIconProvider.defaultIconSet('img/icons/sets/core-icons.svg', 24);
		//$mdIconProvider.fontSet('md', 'MaterialDesign-Webfont-master/fonts/materialdesignicons-webfont.woff2');
	});
	
	//.config(config)
	//.run(['smConfSrv', function (smConfSrv) {
	//	var config = window.appConfig;
	//	smConfSrv.set(config);
	//}]);

//config.$inject = ['$logProvider', '$locationProvider'];

/*function config($logProvider, $locationProvider) {
	$logProvider.debugEnabled(false);

	$locationProvider.html5Mode({enabled : true, requireBase: false});
	$locationProvider.hashPrefix('!');
}*/

