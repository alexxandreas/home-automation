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

var js = [
    '../src/config.js',
    '../src/*.js'
    ];
    
var distDebug = '../dist/debug';
var distRelease = '../dist/release';
var debug = true;


gulp.task('build-debug', function(cb){
    debugMode = true;
	runSequence('build', cb);
});

gulp.task('build-release', function(cb){
    debugMode = false;
	runSequence('build', cb);
});



// Concatenate and minify JavaScript
gulp.task('build', ['clean'], function() {
	return gulp.src(js)
		.pipe($.concat('app.js'))
		.pipe(gulp.dest(debug ? distDebug : distRelease))
		//.pipe($.uglify({preserveComments:'license', mangle: false}))
		//.pipe(gulp.dest(distRelease+'app'));
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
	del([debug ? distDebug : distRelease],
		{dot: true, force: true},
		function (err, paths) {
			return cb();
		}
	);
});


