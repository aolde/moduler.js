var gulp = require('gulp');
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    header = require('gulp-header'),
    zip = require('gulp-zip'),
    qunit = require('gulp-qunit'),
    path = require('path'),
    replace = require('gulp-replace'),
    pkg = require('./package.json');

var banner = ['/*!',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %> - <%= date %>',
  ' * @link <%= pkg.homepage %>',
  ' */',
  ''].join('\n');

gulp.task("clean", function () {
    return gulp.src("build", { read: false })
        .pipe(clean());
});

gulp.task('library', ["clean"], function() {
    return gulp.src(['src/moduler.js'])
        .pipe(jshint({ '-W030': true }))
        .pipe(jshint.reporter('default'))
        
        .pipe(header(banner, { pkg: pkg, date: dateToYMD(new Date()) } ))
        .pipe(rename("moduler-" + pkg.version + ".js"))
        .pipe(gulp.dest("build"))

        .pipe(replace('*/', "* //@ sourceMappingURL=moduler-" + pkg.version + ".min.js.map\n*/"))
        .pipe(rename("moduler-" + pkg.version + ".min.js"))
        .pipe(uglify({ outSourceMap: true, preserveComments: "some" }))
        .pipe(gulp.dest('build'));
});

gulp.task('sourcemap', ['library'], function() {
    return gulp.src('build/moduler-' + pkg.version + '.min.js.map')
        .pipe(replace('["?"]', '["moduler-' + pkg.version + '.js"]'))
        .pipe(gulp.dest('build'));
});

gulp.task('modules', ['sourcemap'], function() {
    return gulp.src(["src/modules/*", '!**/background.js', '!**/json-response.js', '!**/validation.js'])
        .pipe(jshint({ '-W030': true }))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest("build/modules"));
});

gulp.task('package', ['modules', 'library'], function () {
    gulp.src('*', {cwd: path.join(process.cwd(), 'build')})
        .pipe(zip('moduler-js-' + pkg.version + '.zip'))
        .pipe(gulp.dest('build'));

    gulp.src(['*', 'modules/*'], {cwd: path.join(process.cwd(), 'build')})
        .pipe(zip('moduler-js-' + pkg.version + '-with-modules.zip'))
        .pipe(gulp.dest('build'));
});

gulp.task('tests', function (cb) {
    return gulp.src('/tests/tests.html')
        .pipe(qunit());
});

gulp.task('default', ['tests', 'modules', 'package'], function() {
  
  // Watch files and run tasks if they change
  //gulp.watch('src/**', function(event) {
  //  gulp.run('scripts');
  //});
});

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}