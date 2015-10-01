var gulp    = require('gulp'),
    sass    = require('gulp-sass'),
    prefix  = require('gulp-autoprefixer'),
    spawn   = require('child_process').spawn,
    uglify  = require('gulp-uglify'),
    concat  = require('gulp-concat'),
    cssmin  = require('gulp-minify-css'),
    htmlmin = require('gulp-minify-html'),
    gutil   = require('gulp-util'),
    node;

gulp.task('default', ['server'], function() {
  gulp.watch(['server.js', 'shared/*.js', 'modules/*.js', 'routes/*.js'], ['server']);
  gulp.watch('client/**/*.js', ['scripts']);
  gulp.watch('client/**/*.scss', ['styles']);
  gulp.watch('client/**/*.html', ['html']);
});

gulp.task('server', ['styles', 'scripts', 'html'], function() {
  if (node) node.kill();
  node = spawn('node', ['server.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gutil.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('dev-server', ['styles', 'scripts', 'html'], function() {
  if (node) node.kill();
  var env = Object.create(process.env);
  env.PORT = 4000;
  node = spawn('node', ['server.js'], {stdio: 'inherit', env: env});
  node.on('close', function (code) {
    if (code === 8) {
      gutil.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('styles', function() {
  gulp.src(['client/scss/app.scss','client/**/*.scss'])
      .pipe(concat('app.css'))
      .pipe(sass().on('error', sass.logError))
      .pipe(prefix())
      .pipe(cssmin())
      .pipe(gulp.dest('public/'));
});

gulp.task('scripts', function() {
  gulp.src(['client/js/jquery.js', 'client/js/draw.js', 'client/js/geoDict.js', 'client/**/*.js'])
      .pipe(uglify().on('error', sass.logError))
      .pipe(concat('app.js'))
      .pipe(gulp.dest('public/'));
});

gulp.task('html', function() {
  gulp.src(['client/*.html'])
    .pipe(concat('index.html'))
    .pipe(htmlmin())
    .pipe(gulp.dest('public/'));
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill();
});
