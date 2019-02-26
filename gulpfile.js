var gulp = require('gulp');//基础库
var uglify = require('gulp-uglify');//js压缩
var babels = require('gulp-babel');
gulp.task('jsmin', function () {
    gulp.src("./src/app/daily/cmd.js")
        .pipe(uglify())
        .pipe(gulp.dest('./dist/index.js'));
});