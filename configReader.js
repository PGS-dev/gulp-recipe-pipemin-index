'use strict';

module.exports = function ($, config) {
    config = $.lodash.merge({
            sources: {
                index: []
            },
            paths: {
                pipeminTmp: 'tmp/'
            },
            tasks: {
                pipeminIndex: 'index',
                pipeminWatchIndex: 'watch:index'
            },
            order: {
                postDevAssetsSort: 100
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

    // force dev assets to be {read: false} for performance
    config.sources.devAssets = {files: config.sources.devAssets, read: false};
    return config;
};