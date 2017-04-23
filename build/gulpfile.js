var gulp = require('gulp');
//var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var print = require('gulp-print');
var angularTemplatecache = require('gulp-angular-templatecache');

//var gulpConnect = require('gulp-connect');
//var templateCache = require('gulp-angular-templatecache');
var del = require('del');

var fs = require('fs');
var path = require('path');

//var appJs = ['../src/app/**/_*.js','../src/app/**/*.js']; // not include config.js 
//var appCss = ['../src/app/**/_*.less', '../src/app/**/*.less'];
//var appViews = ['../src/app/**/*.html']; // not include index.html 

//var watchStatic_ = ['../src/**/*.{html,scss,less,css,svg}'];
//var statics = ['../src/static/**/*']; // статика
//var index = '../src/index.html';
//var debugConfig = '../src/config_debug.js';
//var releaseConfig = '../src/config_release.js';
//var index = ['../src/index.html', '../src/config.js']; // файлы, копируемые в dist напрямую

//var debugMode = false;
//var distDebug = '../dist/debug/';
// var distRelease = '../dist/release/';

// JS, собираемые в файл модуля
var js = [
    '../src/config.js',
    '../src/*.js'
];
    
// либы, используемые на фронте
var libsJs = [
	'./node_modules/angular/angular.js',
	'./node_modules/angular-animate/angular-animate.js',
	'./node_modules/angular-aria/angular-aria.js',
	'./node_modules/angular-material/angular-material.js',
	
	// './node_modules/md-data-table/dist/md-data-table.js',
	// './node_modules/md-data-table/dist/md-data-table-templates.js',
	// './node_modules/angular-material-icons/angular-material-icons.js',
	// './node_modules/angular-sanitize/angular-sanitize.js',
	// './node_modules/lodash/index.js',
	// './node_modules/jquery/dist/jquery.js'
	'./node_modules/angular-material-data-table/dist/md-data-table.js'
];
	
// css-sы, используемые на фронте
var libsCss = [
	'./node_modules/angular-material/angular-material.css',
	//'./node_modules/md-data-table/dist/md-data-table-style.js',
	//'./node_modules/angular-material-icons/angular-material-icons.css'
	'./node_modules/angular-material-data-table/dist/md-data-table.css'
];
	
// JS клиентского приложения
var appJs = [
	'../src/modules/*/htdocs/**/_*.js',
	'../src/modules/*/htdocs/**/*.js',
	'!../src/modules/*/htdocs/**/-*.js'	
];

// CSS клиентского приложения
var appCss = [
	'../src/modules/*/htdocs/**/*.css'
];

// Views клиентского приложения
var appViews = [
	'../src/modules/*/htdocs/**/*.html',
	'!../src/modules/**/index.html'
]

// index.html клиентского приложения  
var appIndex = [
	'../src/modules/WebServer/index.html'
]

// путь к модулям. файлы модулей склеиваются в один файл
var modulesPath = '../src/modules';
    
// Файлы, копируемые в каталог сборки
var copyToRootFiles = [
 
    //'../src/**',
    '../src/*',
    
    //'../src/modules/*/htdocs/index.html',
    '!../src/modules/*/htdocs/**/*.js',
    '!../src/modules/*/htdocs/**/*.css'
    ];
    
var distDebug = '../dist/debug';
var distRelease = '../dist/release';
var debugMode = true;


gulp.task('build-debug', function(cb){
    debugMode = true;
	runSequence('build', cb);
});

gulp.task('build-release', function(cb){
    debugMode = false;
	runSequence('build', cb);
});



gulp.task('build-js', function(cb){
    return gulp.src(js)
		.pipe(concat('index.js'))
		.pipe(gulp.dest(debugMode ? distDebug : distRelease));
});

gulp.task('copy-index', function(cb){
	//return gulp.src('../src/modules/WebServer/index.html', {base: 'WebServer'})
	return gulp.src('WebServer/htdocs/index.html', {cwd: '../src/modules'})
	//.pipe(concat('libs.css'))
	.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

gulp.task('build-libs-js', function(cb){
	return gulp.src(libsJs)
	.pipe(concat('libs.js'))
	.pipe(uglify({preserveComments:'license', mangle: false}))
	.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

gulp.task('build-libs-css', function(cb){
	return gulp.src(libsCss)
	.pipe(concat('libs.css'))
	.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

gulp.task('build-app-js', function(cb){
	return gulp.src(appJs)
	.pipe(print())
	.pipe(concat('app.js'))
	//.pipe(uglify({preserveComments:'license', mangle: false}))
	.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

gulp.task('build-app-css', function(cb){
	return gulp.src(appCss)
	.pipe(print())
	.pipe(concat('app.css'))
	.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

gulp.task('build-app-views', function() {
	var options = {
		root: '/views/',
		standalone: true,
		module: 'Views'
	};
	return gulp.src(appViews)
		.pipe(print())
		//.pipe($.htmlmin({collapseWhitespace: true, removeComments:true}))
		// .pipe(templateCache('views.js', options))
		.pipe(angularTemplatecache('views.js', options))
		.pipe(gulp.dest((debugMode ? distDebug : distRelease) + '/htdocs'));
});

// Собирает модули из нескольких файлов в один
gulp.task('build-modules', function(cb){
	
	var folders = getFolders(modulesPath);
	console.log(JSON.stringify(folders));

	var tasks = folders.map(function(folder) {
    	return gulp.src([path.join(modulesPath, folder, '/_*.js'), path.join(modulesPath, folder, '/*.js')])
        // concat into foldername.js
        .pipe(concat(folder + '.js'))
        // write to output
        .pipe(gulp.dest(debugMode ? path.join(distDebug, 'modules', folder) : path.join(distRelease, 'modules', folder)))
        
        //.pipe(gulp.dest(scriptsPath)) 
        // minify
        //.pipe(uglify())    
        // rename to folder.min.js
        //.pipe(rename(folder + '.min.js')) 
        // write to output again
        //.pipe(gulp.dest(scriptsPath));    
	});

	//return merge(tasks);
	cb();
	
	function getFolders(dir) {
	    return fs.readdirSync(dir).filter(function(file) {
	        return fs.statSync(path.join(dir, file)).isDirectory();
	    });
	}
});

gulp.task('copy-files', function(cb){
    return gulp.src(copyToRootFiles)
    	.pipe(print())
		.pipe(gulp.dest(debugMode ? distDebug : distRelease))
});

// Concatenate and minify JavaScript
gulp.task('build', ['clean'], function(cb) {
	runSequence(
		//..'build-js',
		'copy-index',
		'build-libs-js',
		'build-libs-css',
		'build-app-js',
		'build-app-css',
		'build-app-views',
		'build-modules',
		'copy-files',
		//'rebuildStatic',
		cb);
});


gulp.task('watch', function (cb) {
	gulp.watch([js], function () {
		runSequence(
			'build'
		);
	});
	return cb();
});



// // Build production files, the default task
// gulp.task('build', ['clean'], function (cb) {
// 	runSequence(
// 		//'fonts',
// 		'libs',
// 		'app',
// 		'copy-static',
// 		'copy-index',
// 		//'rebuildStatic',
// 		cb);
// });


gulp.task('build-watch-debug', function (cb) {
	runSequence(
		'build',
		'watch',
		cb);
});

gulp.task('clean', function(cb){
	del([debugMode ? distDebug : distRelease],
		{dot: true, force: true},
		function (err, paths) {
			return cb();
		}
	);
});


