'use strict';

/**
 * Index file processing with pipemin for development
 *
 * @param $
 * @param config
 * @param sources
 * @config paths.pipeminTmp destination temp
 * @config paths.tmp
 * @sequential preDevBuild Preprocess index file before it hits pipemin
 * @sequential postDevBuild Post-process index before writing to fs
 * @sequential postDevAsset Hook just after dev assets source pipe
 * @returns {*} postDevAssetSort
 */
module.exports = function ($, config, sources) {
    var _ = $.lodash;

    /**
     * Builds index with pipemin
     * @task index
     * @config tasks.pipeminIndex
     * @config tasks.index
     * @config sources.index index files to process
     * @config sources.assets assets list to be referenced in index file
     */
    function pipeminIndexTask() {
        var preBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('preDevBuild'));
        var postBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevBuild'));
        var postDevAssetPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevAsset'));
        var assetStream = sources.assets.pipe(postDevAssetPipe);

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
        $.utils.watchSource([sources.assets], {
            events: ['add', 'unlink']
        }, _.debounce(function () {
            $.utils.runSubtasks(config.tasks.pipeminIndex);
        }, 50))();

        $.utils.watchSource([sources.index, sources.indexDeps], function () {
            $.utils.runSubtasks(config.tasks.pipeminIndex);
        })();
    }

    $.utils.maybeTask(config.tasks.pipeminWatchIndex, pipeminWatchIndexTask);
    $.utils.maybeTask(config.tasks.pipeminIndex, pipeminIndexTask);

    return {
        /**
         * @hooks pipes.postDevAsset* dev assets sorting
         * @config order.postDevAssetSort
         */
        pipes: {
            postDevAssetSort: [config.order.postDevAssetSort, $.utils.sortFiles]
        },
        /**
         * @hooks preServe index task
         */
        preServe: config.tasks.pipeminIndex,
        watch: config.tasks.pipeminWatchIndex
    };
};