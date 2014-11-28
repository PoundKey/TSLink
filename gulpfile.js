var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload')
  minify = require('gulp-minify-css');


gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js ejs css',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed();
    }, 500);
  });
});

gulp.task('minify', function() {
  gulp.src('./tmp/*.css')
    .pipe(minify({keepBreaks:false}))
    .pipe(gulp.dest('./public/css'))
});

gulp.task('default', [
  'develop', 'minify'
]);


