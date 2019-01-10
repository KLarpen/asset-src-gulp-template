"use strict";
const   gulp            =       require("gulp"),
        autoprefixer    =       require("autoprefixer"),
        postcss         =       require('gulp-postcss'),
        del             =       require("del"),
        sourcemaps      =       require("gulp-sourcemaps"),
        csscomb         =       require("gulp-csscomb"),
        imagemin        =       require('gulp-imagemin'),
        plumber         =       require("gulp-plumber"),
        sass            =       require("gulp-sass"),
        cssbeautify     =       require("gulp-cssbeautify"),
        uglify          =       require("gulp-uglify-es").default,
        cssnano         =       require("gulp-cssnano"),
        rename          =       require('gulp-rename'),
        watch           =       require("gulp-watch"),
        htmlmin         =       require('gulp-htmlmin'),
        run             =       require("run-sequence");

const path = {
    scss: '../src/scss/**/*.scss',
    css: '../build/css/',
    srcJs: '../src/js/**/*.js',
    buildJs: '../build/js/',
    srcImages : '../src/image/**/*.*',
    buildImages: '../build/image/',
    srcHTML: '../src/html/*.html',
    buildHTML: '../build/',
    srcFonts: '../src/fonts/',
    buildFonts: '../build/fonts/',

};
gulp.task('scss', function () {
   return gulp.src(path.scss)
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(sass({
           sourceComments: 'normal'
       }))
       .pipe(sourcemaps.write())
       .pipe(cssbeautify())
       .pipe(csscomb())
       .pipe(postcss([ autoprefixer('last 10 versions', '> 1%', 'ie 8', 'ie 7')]))
       .pipe(gulp.dest(path.css))
       .pipe(cssnano())
       .pipe(rename({suffix: '.min'}))
       .pipe(gulp.dest(path.css));
});

gulp.task('js', function () {
    return gulp.src(path.srcJs)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.buildJs));
});

gulp.task('html', function () {
    return gulp.src([path.srcHTML])
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest(path.buildHTML));
});

gulp.task('img', function () {
   return gulp.src(path.srcImages)
       .pipe(imagemin({
           optimizationLevel: 3,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           interlaced: true
       }))
       .pipe(gulp.dest(path.buildImages));
});

/*
* After using the image optimization task "img" you should clean the folder src/image by task: 
* "cleanSrcImg"
* */
gulp.task('cleanSrcImg', function () {
    return del(['../src/image/**/*', '!../src/image', '!../src/image/.gitkeep'], {force: true});
});

gulp.task('watch', function () {
   watch([path.scss], function () {
       gulp.start('scss')
   });
   watch([path.srcJs], function () {
       gulp.start('js')
   });
   watch([path.srcHTML], function () {
    gulp.start('html')
});
   /* watch([path.srcImages], function () {
       gulp.start('img');
   }); */
});


gulp.task('default', function (cb) {
   run(
       'scss',
       'js',
       'html',
       'watch',

       cb
   )
});

