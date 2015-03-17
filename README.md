# [gulp-recipe](https://github.com/PGS-dev/gulp-recipe-loader)-pipemin-index [![Dependency Status][depstat-image]][depstat-url]
[![NPM][npm-image]][npm-url]

Container for fast project compilation with hooks, based on [gulp-pipemin](https://github.com/Frizi/gulp-pipemin).

## Tasks
### index

Compile index file and save in temp directory for serving.

### watch:index
> deps: index

Watch all index file dependencies and recompile it on change.

## Configuration
### Recipe specific

### [Sources](https://github.com/PGS-dev/gulp-recipe-loader#sources-configuration-syntax)
#### sources.index
> mandatory<br>
> flow: sources.index -> pipes.preBuild* -> pipemin -> merge with build -> pipes.postMerge* -> dest

Entry point html files (index.html) to be processed with [gulp-pipemin](https://github.com/Frizi/gulp-pipemin).
These files will also be watched by watch:index task.

> example config:
```javascript
sources.index = 'app/index.html';
```

#### sources.devAssets
> mandatory<br>
> flow: sources.devAssets -> pipemin's assetStream

Files that will be treated as assets for pipemin. Names of these files will be sorted and then fed to glob paths in index.html.
These files will also be watched by watch:index task.<br>

> example config:
```javascript
sources.devAssets = [
    'app/bower_components/*/*.js',
    'app/bower_components/*/{dist,min,release}/*.{js,css}', // most of the generic bower modules
    sources.js, // include only when serving non-processed js files
    sources.css // include only when serving non-processed css files
    { files: paths.tmp + '**/*', base: paths.tmp } // all processed files from temp directory
];
```

**Note** for recipe developer: there is no hook for transforming files in here (for optimization purposes). All compiled files should be saved in temp folder, not compiled every request.<br>
If you need to sort your assets differently, use *pipes.devAsset\** hook and do your own sorting.

### Paths
#### paths.pipeminTmp
> alias: paths.tmp<br>
> default: 'tmp/'

Path to index task output directory.

### Tasks
#### tasks.pipeminIndex
> alias tasks.index<br>
> default 'index'

_index_ task name.

#### tasks.pipeminWatchIndex
> alias tasks.watchIndex<br>
> default 'watch:index'

_watch:index_ task name.

### Order
#### config.order.postDevAssetsSort
> default: 100

Order of task for devAssets files sorting.

## Api
### Provided Hooks
#### pipes.devAsset*
> type: source<br>

Additional assets feeding to pipemin. Use it to do your own sorting.

#### pipes.postDevAsset*
> type: sequence<br>
> flow: sources.devAssets -> pipes.postDevAsset* -> pipemin's assetStream

Process all asset files before feeding them into pipemin.<br>
Note: sources.devAssets are marked as {read: false}, no file's content will be provided,
and no transformed file will be actually written to disk. This is mainly intended for
ordering or filename operations.

#### pipes.preDevBuild*
> type: sequence<br>

Do actions on index just before feeding it into pipemin.

#### pipes.postDevBuild*
> type: sequence<br>

Do actions on index files from pipes.build*. Example usage in [gulp-recipe-pipemin-rev](https://github.com/PGS-dev/gulp-recipe-pipemin-rev).

### Used Hooks
#### postDevAssetsSort

Sorts raw assets files by name and places into hook.

#### preServe

Register _index_ task to preServe.

#### watch

Register _watch:index_ task to global watch.

Minify html

[npm-url]: https://npmjs.org/package/gulp-recipe-pipemin-index
[npm-image]: https://nodei.co/npm/gulp-recipe-pipemin-index.png?downloads=true
[depstat-url]: https://david-dm.org/PGS-dev/gulp-recipe-pipemin-index
[depstat-image]: https://img.shields.io/david/PGS-dev/gulp-recipe-pipemin-index.svg?style=flat