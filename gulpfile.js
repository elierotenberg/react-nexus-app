require('6to5/polyfill');
var _ = require('lodash');
var should = require('should');
var Promise = (global || window).Promise = require('bluebird');
var __DEV__ = (process.env.NODE_ENV !== 'production');
var __PROD__ = !__DEV__;
var __BROWSER__ = (typeof window === 'object');
var __NODE__ = !__BROWSER__;
if(__DEV__) {
  Promise.longStackTraces();
}

var concat = require('gulp-concat');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core')({ cascade: true });
var cssbeautify = require('gulp-cssbeautify');
var cssmqpacker  = require('css-mqpacker');
var csswring = require('csswring');
var del = require('del');
var es6to5 = require('gulp-6to5');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gwebpack = require('gulp-webpack');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var prepend = require('gulp-insert').prepend;
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var styles = require('gulp-react-statics-styles');
var stylish = require('jshint-stylish');
var webpack = require('webpack');
var uglify = require('gulp-uglify');

var prelude = fs.readFileSync('./__prelude.js');

function clean(fn) {
  del(['dist'], fn);
}

function lint() {
  return gulp.src(['src/**/*.js', '!src/public/**/*.js'])
  .pipe(plumber())
  .pipe(jshint())
  .pipe(jshint.reporter(stylish));
}

function build() {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx', '!src/public/**/*.js'])
    .pipe(plumber())
    .pipe(prepend(prelude))
    .pipe(es6to5({
      modules: 'common',
    }))
    .pipe(rename({ extname: '.js' }))
  .pipe(gulp.dest('dist'));
}

function copy() {
  return gulp.src('src/public/**/*.*')
  .pipe(gulp.dest('dist/public'));
}

function css() {
  return gulp.src('dist/components/*.js')
    .pipe(styles())
    .pipe(__DEV__ ? sourcemaps.init() : gutil.noop())
    .pipe(concat('c.css'))
    .pipe(postcss([autoprefixer]))
    .pipe(cssbeautify({ indent: '  ', autosemicolon: true }))
    .pipe(__PROD__ ? postcss([cssmqpacker, csswring]) : gutil.noop())
    .pipe(__DEV__ ? sourcemaps.write() : gutil.noop())
  .pipe(gulp.dest('dist/public'));
}

function bundle() {
  return gulp.src('dist/client.js')
  .pipe(plumber())
  .pipe(gwebpack({
    target: 'web',
    debug: __DEV__,
    devtool: __DEV__ ? 'eval': false,
    module: {
      loaders: [{ test: /\.json$/, loader: 'json-loader' }],
    },
    plugins: [
      new webpack.IgnorePlugin(/^fs$/),
      new webpack.DefinePlugin({
        '__DEV__': JSON.stringify(__DEV__),
        '__PROD__': JSON.stringify(__PROD__),
        '__BROWSER__': JSON.stringify(true),
        '__NODE__': JSON.stringify(false),
        'process.env': { NODE_ENV: JSON.stringify(__DEV__ ? 'development' : 'production') },
      }),
      new webpack.optimize.DedupePlugin(),
    ],
  }, webpack))
  .pipe(rename({ basename: 'c' }))
  .pipe(__PROD__ ? uglify({
    mangle: {
      except: ['GeneratorFunction'],
    },
  }) : gutil.noop())
  .pipe(gulp.dest('dist/public'));
}

gulp.task('clean', clean);
gulp.task('copy', ['clean'], copy);
gulp.task('lint', lint);
gulp.task('build', ['copy', 'lint'], build);
gulp.task('bundle', ['build'], bundle);
gulp.task('css', ['build'], css);
gulp.task('default', ['build', 'bundle', 'css']);
