const gulp = require('gulp');

gulp.task('build:icons', () => {
  return gulp.src(['nodes/**/*.png', 'triggers/**/*.png'], { base: '.' })
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', gulp.series('build:icons'));
