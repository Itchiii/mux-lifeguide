//gulpfile.js
const gulp = require('gulp'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      rename = require('gulp-rename'),
      terser = require('gulp-terser'),
      pump = require('pump'),
      cleanCSS = require('gulp-clean-css'),
      csscomb = require('gulp-csscomb');

//style paths
const scssFiles = 'public/css/*.scss',
      jsFiles ='public/js/*.js',
      cssCompDest = 'public/css/compress/',
      jsDest = 'public/js/compress/';

gulp.task('styles', function (cb) {
  pump([
      gulp.src('public/css/style.scss'),
      sass(),
      rename('style.css'),
      gulp.dest(cssCompDest),
      cleanCSS(),
      rename('style.min.css'),
      gulp.dest(cssCompDest)
    ],
    cb
  );
});

gulp.task('comb', function (cb) {
  pump([
      gulp.src(scssFiles),
      csscomb('csscomb.json'),
      gulp.dest('public/css/')
    ],
    cb
  );
});

gulp.task('scripts', function (cb) {
  pump([
        gulp.src(jsFiles),
        concat('scripts.js'),
        terser(),
        rename('script.min.js'),
        gulp.dest(jsDest)
    ],
    cb
  );
});

gulp.task('watch',function() {
    gulp.watch(scssFiles, gulp.series('styles'));
});
