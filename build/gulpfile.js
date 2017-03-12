var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

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
    
// Файлы, копируемые в каталог сборки
var copyToRootFiles = [
    //'../src/update.bash'
    '../src/**'
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
		.pipe($.concat('index.js'))
		.pipe(gulp.dest(debugMode ? distDebug : distRelease))
		//.pipe($.uglify({preserveComments:'license', mangle: false}))
		//.pipe(gulp.dest(distRelease+'app'));
});

gulp.task('copy-files', function(cb){
    return gulp.src(copyToRootFiles)
		.pipe(gulp.dest(debugMode ? distDebug : distRelease))
});

// Concatenate and minify JavaScript
gulp.task('build', ['clean'], function(cb) {
	runSequence(
		//..'build-js',
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


