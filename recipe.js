'use strict';

/**
 * Index file processing with pipemin for development
 *
 * @param $
 * @param config
 * @param sources
 * @config paths.pipeminTmp destination temp
 * @config paths.tmp
 * @merged devAssets Asset files for dev pipemin
 * @sequential preDevBuild Preprocess index file before it hits pipemin
 * @sequential postDevBuild Post-process index before writing to fs
 * @sequential postDevAssets Hook just after dev assets source pipe
 * @returns {*} postDevAssetsSort
 */
module.exports = function ($, config, sources) {
    var _ = $.lodash;

    function devAssetPipe() {
        return $.utils.mergedLazypipe($.utils.getPipes('devAsset'));
    }

    /**
     * Builds index with pipemin
     * @task index
     * @config tasks.pipeminIndex
     * @config tasks.index
     * @config sources.index index files to process
     * @config sources.devAssets assets list to be referenced in index file
     */
    function pipeminIndexTask() {
        var preBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('preDevBuild'));
        var postBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevBuild'));
        var postDevAssetsPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevAssets'));


        var assetStream = $.utils.mergedLazypipe([sources.devAssets.pipe(postDevAssetsPipe), devAssetPipe()]);

        return $.lazypipe()
            .pipe(sources.index)
            .pipe(preBuildPipe)
            .pipe($.pipemin, {
                assetsDir: '{' + assetStream.bases.join(',') + '}',
                assetsStream: assetStream,
                js: null,
                css: null
            })
            .pipe(postBuildPipe)
            .pipe($.gulp.dest, config.paths.pipeminTmp)();
    }


    /**
     * Run watching on index and all dev assets, recompile index
     * @task watch:index
     * @config tasks.pipeminWatchIndex
     * @config tasks.watchIndex
     */
    // no dependency on index, as preServe will be called by server
    function pipeminWatchIndexTask() {
        $.utils.watchSource([devAssetPipe(), sources.devAssets, sources.index], {
            events: ['add', 'unlink']
        }, _.debounce(function (vinyl) {
            console.log(vinyl.event, vinyl.path);
            $.utils.runSubtasks(config.tasks.pipeminIndex);
        }, 100))();
    }

    $.utils.maybeTask(config.tasks.pipeminWatchIndex,pipeminWatchIndexTask);
    $.utils.maybeTask(config.tasks.pipeminIndex, pipeminIndexTask);

    return {
        /**
         * @hooks pipes.postDevAssets* dev assets sorting
         * @config order.postDevAssetsSort
         */
        pipes: {
            postDevAssetsSort: [config.order.postDevAssetsSort, $.utils.sortFiles]
        },
        /**
         * @hooks preServe index task
         */
        preServe: config.tasks.pipeminIndex,
        watch: config.tasks.pipeminWatchIndex
    };
};