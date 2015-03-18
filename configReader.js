'use strict';

module.exports = function ($, config) {
    var _ = $.lodash;

    $.utils.checkMandatory(config, ['sources.index', 'sources.assets']);

    config = _.merge({
            paths: {
                pipeminTmp: 'tmp/'
            },
            tasks: {
                pipeminIndex: 'index',
                pipeminWatchIndex: 'watch:index'
            },
            order: {
                postDevAssetSort: 100
            }
        }, {
            paths: {
                pipeminTmp: config.paths.tmp
            },
            tasks: {
                pipeminIndex: config.tasks.index,
                pipeminWatchIndex: config.tasks.watchIndex
            }
        },
        config);

    var tempFiles = {
        files: config.paths.pipeminTmp + '/**',
        base: config.paths.pipeminTmp
    };

    // add temp folder to dev sources and force assets to be {read: false} for performance.
    config.sources.assets = {files: [config.sources.assets, tempFiles], read: false};

    config.sources = _.pick(config.sources, 'assets', 'index');
    return config;
};