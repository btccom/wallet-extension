var webpack = require('webpack');
var webpackConfigFunc = require('./webpack.config');
var gulp = require('gulp');
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var jsoncombine = require('gulp-jsoncombine');
var minimist = require('minimist');
var packageConfig = require('./package.json');
const { exit } = require('process');
const uglify = require('gulp-uglify');

//parse arguments
var knownOptions = {
  string: ['env', 'browser', 'manifest'],
  default: {
    env: 'dev',
    browser: 'chrome',
    manifest: 'mv3',
  }
};

var supported_envs = ['dev', 'pro'];
var productName = 'BTC.com';
var version = packageConfig.version;
var validVersion = version.split('-beta')[0];
var options = {
  env: knownOptions.default.env,
  browser: knownOptions.default.browser,
  manifest: knownOptions.default.manifest
};
options = minimist(process.argv.slice(2), knownOptions);
if (!supported_envs.includes(options.env)) {
  console.error(`not supported env: [${options.env}]. It should be one of ${supported_envs.join(', ')}.`);
  exit(0);
}

//tasks...
function task_clean() {
  return gulp.src(`dist/${options.browser}/*`, { read: false }).pipe(clean());
}

function task_prepare() {
  return gulp.src('public/**/*').pipe(gulp.dest(`dist/${options.browser}`));
}

function task_merge_manifest() {
  let baseFile = 'v3';
  return gulp
    .src([`dist/${options.browser}/manifest/${baseFile}.json`])
    .pipe(
      jsoncombine('manifest.json', (data, meta) => {
        const result = Object.assign({}, data[baseFile], data[options.browser]);
        result.version = validVersion;
        return Buffer.from(JSON.stringify(result));
      })
    )
    .pipe(gulp.dest(`dist/${options.browser}`));
}

function task_clean_tmps() {
  return gulp.src(`dist/${options.browser}/manifest`, { read: false }).pipe(clean());
}

function task_webpack(cb) {
  webpack(
    webpackConfigFunc({
      version: validVersion,
      config: options.env,
      browser: options.browser,
      manifest: options.manifest,
    }),
    cb
  );
}

function task_uglify(cb) {
  if (options.env == 'pro') {
    return gulp
      .src(`dist/${options.browser}/**/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(`dist/${options.browser}`));
  }
  cb();
}
function getDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  const timestamp = `${year}${month}${day}${hour}${minute}`;
  return timestamp;
}
function task_package(cb) {
  if (options.env == 'pro') {
    return gulp
      .src(`dist/${options.browser}/**/*`)
      .pipe(zip(`${productName}-${options.browser}-${options.manifest}-v${version}-${getDate()}.zip`))
      .pipe(gulp.dest('./dist'));
  }
  cb();
}

exports.build = gulp.series(
  task_clean,
  task_prepare,
  task_merge_manifest,
  task_clean_tmps,
  task_webpack,
  task_uglify,
  task_package
);
