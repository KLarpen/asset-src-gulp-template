# Assets` source folder template with Gulp

## Setup
Download & unzip the archived release inside your project's folder where you'd like ```src``` folder to be present. Alternatively you may clone the repository & remove ```.git``` folder in it. Then rename the template folder to just ```src``` and install dependencies inside of it.
```bash
mv ./asset-src-gulp-template ./src
cd ./src
npm i
```

## Structure
All source files assume to be placed in the typed subfolders:
* ```src/scss```
* ```src/js```
* ```src/img```

There is example files in the ```scss``` and ```js``` folders that you may delete. Images folder have no example images but contain ```icons``` folder to keep the structure. 

The output files will be placed inside ```assets``` folder. It will be created during first time processing at the parent folder one level up (as a sibling to ```src``` folder). The ```assets``` structure:
* ```assets/img/``` – the same structure as at source but with optimised images;
* ```assets/css/``` – custom style files will be here;
* ```assets/css/bootstrap``` – 3rd party module's styles will be copied to the vendor-specific subfolders (Bootstrap as an example);
* ```assets/js``` – custom script files and mixed bundles will be here;
* ```assets/js/bootstrap``` – 3rd party module's scripts will be copied to the vendor-specific subfolders;

The workflow assumes that tasks do not clean the ```assets``` folder. The folder must be saved in the repository to be available on production without a build step.

## Settings
The ```package.json``` file contains [browserslist](https://github.com/browserslist/browserslist#queries) property that used by the Autoprefixer and Babel during the sass & JavaScript processing respectively. The property describes the target browsers. Check the documentation by the link above to properly set the queries for your specific project. Example set of queries:
```json
{
  "browserslist": [
    "last 1 major version",
    ">= 0.5%",
    "Chrome >= 55",
    "Firefox >= 52",
    "Edge >= 15",
    "Safari >= 11",
    "iOS >= 10",
    "not ie <= 11",
    "not dead"
  ]
}
```
The ```gulpfile.js``` contains declaration of the two setting constants: ```paths``` and ```libs```. The ```paths``` constant mainly describes a source and destination for every entry type. The only thing that you must to edit is ```paths.scripts.config```:
```js
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
}
```
The ```paths.scripts.config``` is an array of objects like ```{ src: Array<String>, script: String }```. Each object describe source and final name of the specific output script:
* ```src``` property contains array of the strings, each of wich is a path to source script file. There might be single source file from the ```src/js/``` folder as well as multiple files from the different folders (including ```node_modules/...```). All files from ```src``` property will be concatenated and processed to a final script.
* ```script``` property is a simple string with final script name.

Starter configuration consists of ```main.js``` entry and two other examples: single script ```third.js``` and ```main.bundle.js``` wich consists of bundled together ```bootstrap.js```, ```main.js``` and ```other.js```.

The ```libs``` constant is an array of objects like ```{ src: String, dest: String }```. Each object describe where to get and where to place modules and libraries from different sources. That property used by ```gulp lib``` task wich copy the files or whole folders without any transformation. You can have no libs to copy:
```js
const libs = []; //leave the constant as this
```
Or create as many entries as you needed (including a movement of the files within your project directories):
```js
const libs = [
    {
        // Copy the whole dist folder as jquery
        from: './node_modules/jquery/dist/',
        dest: '../assets/js/jquery/'
    },
    {
        from: './node_modules/bootstrap/dist/js/',
        dest: '../assets/js/bootstrap/'
    },
    {
        // Copy the main style file to the project's root directory 
        // (as for the WordPress Theme)
        from: '../assets/css/style.css',
        dest: '../style.css' 
    }
];
```


## Processing
Template uses the [Gulp](https://gulpjs.com/) task runner. The tasks might be called inside the ```src``` folder by commands: 
* ```gulp``` – run default task wich will process sass, js and will continue to watch changes;
* ```gulp sass``` – process scss files once;
* ```gulp style``` – process scss files and continue watch the changes;
* ```gulp js``` – process js files once;
* ```gulp script``` – process js files and continue watch the changes;
* ```gulp img``` – optimize images;
* ```gulp lib``` – copy 3rd party modules (js, css, etc.) from the ```node_modules``` or other source to the assets folder;
* ```gulp build``` – create or update the assets folder, copy 3rd party libraries and execute once all sass, js and image processing;
* ```gulp cleanSrcImg``` – remove all images from the src folder (Caution! You can not rebuild the images after clearing the source!).

You can also check the all task`s names and structure by executing ```gulp --tasks``` in the terminal.