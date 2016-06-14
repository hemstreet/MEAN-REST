var gulp = require('gulp'),
    nodemon = require('gulp-nodemon');

gulp.task('default', function () {
    nodemon({
        script: 'rest.js'
        , ext: 'js html json'
        , env: {
            'NODE_ENV': 'development',
            'ENV': 'dev',
            'PORT': 3000
        }
    })
});