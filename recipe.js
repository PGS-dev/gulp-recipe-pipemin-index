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
 * @sequential postDevAssets Hook just after dev assets source pipe
 * @returns {*} postDevAssetsSort
 */
module.exports = function ($, config, sources) {
    /**
     * Builds index with pipemin
     * @task index
     * @config tasks.pipeminIndex
     * @config tasks.index
     * @config sources.index index files to process
     * @config sources.devAssets assets list to be referenced in index file
     */
    $.gulp.task(config.tasks.pipeminIndex, function () {
        var preBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('preDevBuild'));
        var postBuildPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevBuild'));
        var postDevAssetsPipe = $.utils.sequentialLazypipe($.utils.getPipes('postDevAssets'));

        return $.lazypipe()
            .pipe(sources.index)
            .pipe(preBuildPipe)
            .pipe($.pipemin, {
                assetsDir: '{' + sources.devAssets.bases.join(',') + '}',
                assetsStream: sources.devAssets.pipe(postDevAssetsPipe),
                js: null,
                css: null
            })
            .pipe(postBuildPipe)
            .pipe($.gulp.dest, config.paths.pipeminTmp)();
    });

    /**
     * Run watching on index and all dev assets, recompile index
     * @task watch:index
     * @config tasks.pipeminWatchIndex
     * @config tasks.watchIndex
     */
    // no dependency on index, as preServe will be called by server
    $.gulp.task(config.tasks.pipeminWatchIndex, function () {
        $.utils.watchSource([sources.devAssets, sources.index], [config.tasks.pipeminIndex]);
    });

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