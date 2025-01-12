const path = require('path'),
    webpack = require('webpack'),
    TerserPlugin = require('terser-webpack-plugin')

module.exports = function () {
    const settings = {
        mode: 'production',
        devtool: 'source-map',
        entry: {
            'albedo.intent': [path.join(__dirname, '/src/index.js')]
        },
        output: {
            path: path.join(__dirname, './lib'),
            filename: '[name].js',
            library: {
                name: 'zingy-wallet',
                type: 'umd',
                export: 'default'
            },
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin(/ed25519/),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            })
        ],
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({
                parallel: true,
                terserOptions: {
                    toplevel: true
                }
            })]
        }
    }
    return settings
}