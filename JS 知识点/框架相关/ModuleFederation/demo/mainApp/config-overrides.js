const path = require('path');
const webpack = require('webpack');

module.exports = {
    // The Webpack config
    webpack: function(config, env) {
        // console.log(config, env)
       
        config.plugins.unshift(new webpack.DefinePlugin({
            __DEV__: env === 'development',
        }))
        return config;
    },
}