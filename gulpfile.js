'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var merge = require('merge');
var mergeStream = require('merge-stream');
var open = require('open');
var path = require('path');
var pkg = require('./package.json');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

gulp.task('build', ['clean'], function() {
  return runSequence('build-raw', 'build-min', 'build-debug');
});

gulp.task('build-raw', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.concat('lfr.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('build-min', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.uglify({
      preserveComments: 'some'
    }))
    .pipe(plugins.concat('lfr-min.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('build-debug', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.concat('lfr-debug.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return gulp.src('build').pipe(plugins.rimraf());
});

gulp.task('format', function() {
  var src = gulp.src(['src/**/*.js'])
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('src'));

  var test = gulp.src(['test/**/*.js'])
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('test'));

    return mergeStream(src, test);
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function(done) {
  return runSequence('test-unit', 'test-complexity', done);
});

gulp.task('test-complexity', function() {
  return gulp.src(['src/**/*.js', '!src/promise/Promise.js', 'test/**/*.js', '!test/fixture/sandbox.js'])
    .pipe(plugins.complexity({
      halstead: [15, 15, 20]
    }));
});

gulp.task('test-unit', function(done) {
  runKarma({}, done);
});

gulp.task('test-coverage', function(done) {
  runKarma({}, function() {
    open(path.join(__dirname, 'coverage/lcov/lcov-report/index.html'));
    done();
  });
});

gulp.task('test-browsers', function(done) {
  runKarma({
    browsers: ['Chrome', 'Firefox', 'Safari']
  }, done);
});

gulp.task('test-watch', function(done) {
  runKarma({singleRun: false}, done);
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
});

// Private helpers
// ===============

function banner() {
  var stamp = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
    ' * @link http://liferay.com',
    ' * @license BSD',
    ' */',
    ''
  ].join('\n');

  return plugins.header(stamp, {
    pkg: pkg
  });
}

function runKarma(config, done) {
  config = merge({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, config);
  karma.start(config, done);
}
