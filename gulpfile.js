"use strict";
const { src, dest, series, parallel, watch } = require("gulp");
const   sourcemaps      = require("gulp-sourcemaps"),
        fse             = require('fs-extra'),
        plumber         = require("gulp-plumber"),
        rename          = require('gulp-rename'),
        postcss         = require('gulp-postcss'),
        autoprefixer    = require("autoprefixer"),
        cssnano         = require("cssnano"),
        sass            = require('gulp-sass'),
        concat          = require('gulp-concat'),
        babel           = require('gulp-babel'),
        uglify          = require("gulp-uglify-es").default;

const paths = {
    styles: {
        src: './scss/**/*.scss',
        dest: '../assets/css/'
    }, 
    scripts: {
        src: './js/**/*.js',
        dest: '../assets/js/',
        config: [
            {
                src: [
                    './js/main.js'
                ],
                script: 'main.js'
            },
            {
                src: [
                    './js/third.js'
                ],
                script: 'third.js'
            },
            {
                src: [
                    './node_modules/bootstrap/dist/js/bootstrap.js',
                    './js/main.js',
                    './js/other.js',
                    '!./js/third.js',
                ],
                script: 'main.bundle.js'
            }
        ]
    },
    images: {
        src: './img/**/*.*',
        dest: '../assets/img/'
    }
};

const libs = [
    {
        from: './node_modules/jquery/dist/',
        dest: '../assets/js/jquery/'
    },
    {
        from: './node_modules/bootstrap/dist/js/',
        dest: '../assets/js/bootstrap/'
    },
    /* {
        // Copy the main style file to the parent project's directory 
        // (as for the WordPress Theme)
        from: '../assets/css/style.css',
        dest: '../style.css' 
    } */
];



function sassTask(cb) {
    src(paths.styles.src)
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(sass({
           sourceComments: 'normal'
       }))
       .pipe( postcss([ autoprefixer() ]) )
       .pipe(dest(paths.styles.dest))
       .pipe( postcss([ cssnano() ]) )
       .pipe(rename({suffix: '.min'}))
       .pipe(sourcemaps.write('.'))
       .pipe(dest(paths.styles.dest))
       .on('end', () => { cb(); });
}

function jsProcessor(source, scriptname) {
    return  new Promise((resolve => {
        src(source)
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat(scriptname))
            .pipe(babel())
            .pipe(dest(paths.scripts.dest))
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('.'))
            .pipe(dest(paths.scripts.dest))
            .on('end', () => { resolve(true); });
    }));
}

function jsTask(cb) {
    let result = paths.scripts.config.map( scriptConf => jsProcessor( scriptConf.src, scriptConf.script ) );
    Promise.all(result).then( () => cb() );
}

function watchSASS() {
    watch(paths.styles.src, sassTask);
}

function watchJS() {
    watch(paths.scripts.src, jsTask);
}

function watchBoth() {
    watch(paths.styles.src, sassTask);
    watch(paths.scripts.src, jsTask);
} 

function imgTask(cb) {
    const imagemin = require('gulp-imagemin');

    src(paths.images.src)
       .pipe(imagemin({
           optimizationLevel: 3,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           interlaced: true
       }))
       .pipe(dest(paths.images.dest))
       .on('end', () => { cb(); });
}

/**
* After using the image optimization task "img" you may clean the src/img folder by task: 
* "cleanSrcImg"
*/
function cleanSrcImg(cb) {
    const del = require("del");
    return del(['./img/**/*.*', '!./img', '!./img/.gitkeep', '!./img/icons/.gitkeep'], {force: true})
        .then(delPaths => {
            console.log('Deleted: ', delPaths);
            cb();
        });
}

const copyFiles = (file, dest) => {
    return fse.copy(file, dest)
    .then(() => {
        console.log(`Successfully copied ${file}`);
    })
    .catch(err => {
        console.error(err);
    });
};

function libTask(cb) {
    let result = libs.map( file => copyFiles( file.from, file.dest ) );
    Promise.all(result).then( () => cb() );
};

// Make tasks public
exports.sass     = sassTask;
exports.js       = jsTask;
exports.style    = series( sassTask, watchSASS );
exports.script   = series( jsTask, watchJS );
exports.img      = imgTask;
exports.lib      = libTask;
exports.cleanSrcImg = cleanSrcImg;

exports.build = series(
    parallel (
        sassTask, 
        jsTask,
        imgTask
    ),
    libTask
);

exports.default = series(
    parallel (
        sassTask, 
        jsTask
    ),
    watchBoth
);