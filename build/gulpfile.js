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
	'./node_modules/md-data-table/dist/md-data-table.js',
	'./node_modules/md-data-table/dist/md-data-table-templates.js'
];
	
// css-sы, используемые на фронте
var libsCss = [
	'./node_modules/angular-material/angular-material.css',
	'./node_modules/md-data-table/dist/md-data-table-style.js'
];
	
// JS клиентского приложения
var appJs = [
	'../src/modules/*/htdocs/**/_*.js',
	'../src/modules/*/htdocs/**/*.js',
	'!../src/modules/*/htdocs/**/-*.js'	
];

var appCss = [
	'../src/modules/*/htdocs/**/*.css'
];

var appViews = [
	'../src/modules/*/htdocs/**/*.html',
	'!../src/modules/**/index.html'
]
    
    
// Файлы, копируемые в каталог сборки
var copyToRootFiles = [
    //'../src/update.bash'
    '../src/**',
    '!../src/modules/*/htdocs/**/*.html',
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

gulp.task('copy-files', function(cb){
    return gulp.src(copyToRootFiles)
		.pipe(gulp.dest(debugMode ? distDebug : distRelease))
});

// Concatenate and minify JavaScript
gulp.task('build', ['clean'], function(cb) {
	runSequence(
		//..'build-js',
		'build-libs-js',
		'build-libs-css',
		'build-app-js',
		'build-app-css',
		'build-app-views',
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


