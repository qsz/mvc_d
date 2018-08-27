const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')
const webpack = require('webpack')

const config = require('./common.js')

const webpackConfig = merge(baseWebpackConfig, {
    //生产模式'production'
    //对于打包速度进行优化
    //不支持watching
    //自动设置process.env.NODE_ENV的值为production
    //自动对代码进行压缩等
    //开启 NoEmitOnErrorsPlugin   在编译出现错误时，自动跳过输出阶段。这样可以确保编译出的资源中不会包含错误。
    //开启 ModuleConcatenationPlugin  开启 optimization.minimize
    mode:'production',
    entry: {
        app: [`${config.SRC_PATH}/pages/app.js`]
    },
    output: {
        path: config.DIST_PATH,
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: 'js/[name].[chunkhash].js'
    },
    //是否启用压缩 , optimization.minimizer 制定压缩库, 默认 uglifyjs-webpack-plugin
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true, // 开启并行压缩，充分利用cpu
                sourceMap: false,
                uglifyOptions: {
                    compress: {
                        unused: true,
                        warnings: false,
                        drop_debugger: true
                    },
                    output: {
                        comments: false
                    }
                }
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessorOptions: {
                    discardComments: { removeAll: false },
                    safe: true,
                    autoprefixer: false
                }
            })  // use OptimizeCSSAssetsPlugin
        ],
        splitChunks: {  //代替 CommonsChunkPlugin
            cacheGroups: {
                lib: {
                    test: /[\\/]node_modules[\\/]/,
                    minSize: 30000,
                    priority: 10,
                    name: 'lib',
                    enforce: true,
                    chunks: "initial"
                },
                common: {
                    minChunks: 2,   // 至少2个入口文件引用 会被打包
                    minSize: 30000,    // 大于>30KB的会被打包
                    priority: 6,
                    name: 'common',
                    chunks: "async",  //异步加载（async）， 同步加载（initial），all（全部）的模块会被打包
                    reuseExistingChunk: true  // 这个配置允许我们使用已经存在的代码块
                }
            }
        },
        runtimeChunk: {
            name: 'manifest'
        }
    }
})

webpackConfig.plugins = webpackConfig.plugins.concat([
    new InlineManifestWebpackPlugin('manifest'),
    new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].css',
    }),
    new webpack.HashedModuleIdsPlugin(),
    new WebpackMd5Hash(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new BundleAnalyzerPlugin({
        analyzerHost: 'localhost',
        analyzerPort: 8887,
        openAnalyzer: false,
    })
])

if (config.copyImg){
    webpackConfig.plugins.push(
        new CopyWebpackPlugin([ // 复制文件夹
            {
                from: config.imgPath,
                to: config.imgCopyPath,
                ignore: ['.*']
            }
        ])
    )
}

module.exports = webpackConfig