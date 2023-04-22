const path = require('path');

module.exports = {
    // The Webpack config
    webpack: function(config, env) {
        config.module.rules[1].oneOf.splice(2, 0, {
            test: /\.less$/i,
            exclude: /\.module\.(less)$/,
            use: [
                { loader: "style-loader" },
                { loader: "css-loader" },
                {
                    loader: "less-loader",
                    options: {
                        lessOptions: {
                            javascriptEnabled: true,
                        },
                    },
                },
            ],
        })
        config.module.rules[1].oneOf.unshift({
            test: /\.svg$/,
            use: [
                {
                    loader: 'svg-inline-loader',
                },
            ],
        })
        
        config.resolve.alias['@'] = path.resolve(__dirname, 'src')
        
        console.log(config)
        
        return config;
    },
    // The Jest config
    // jest: function(config) {
    //     // ...add your jest config customisation...
    //     return config;
    // },
    // create a webpack dev server
    // devServer: function(configFunction) {
    //     return function(proxy, allowedHost) {
    //         const config = configFunction(proxy, allowedHost);
    //         const fs = require('fs');
    //         config.https = {
    //             key: fs.readFileSync(process.env.REACT_HTTPS_KEY, 'utf8'),
    //             cert: fs.readFileSync(process.env.REACT_HTTPS_CERT, 'utf8'),
    //             ca: fs.readFileSync(process.env.REACT_HTTPS_CA, 'utf8'),
    //             passphrase: process.env.REACT_HTTPS_PASS
    //         };
    //         return config;
    //     };
    // }
}