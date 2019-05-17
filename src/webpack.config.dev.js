const webpack = require("webpack");
const chalk = require("chalk");
const DevServer = require("webpack-dev-server");

function webpackConfig(env) {
    return [
        {
            mode: "development" /* development or production */,
            entry: env.entry,
            output: env.output,
            devtool: "cheap-module-source-map",
            optimization: {
                splitChunks: {
                    chunks: "async",
                    automaticNameDelimiter: "-"
                }
            },
            resolve: env.resolve,
            module: {
                rules: env.loaders
            },
            plugins: [
                ...env.plugins,
                new webpack.HotModuleReplacementPlugin(),
                new webpack.ProgressPlugin() /* 控制台显示加载进度 */
            ]
        }
    ];
}

function devServer(compiler, env) {
    return new DevServer(compiler, {
        contentBase: env.server.contentBase /* 静态资源目录 */,
        https: env.server.https /* 必须使用https访问 */,
        proxy: env.server.proxy,
        watchContentBase: true /* contentBase目录下变更数据时自动刷新 */,
        host: "0.0.0.0" /* 使用localhost会导致报错 [WDS] Disconnected! */,
        historyApiFallback: true /* 所有路由不经过服务端,用于SPA单页应用 */,
        disableHostCheck: true,
        hot: true,
        compress: true,
        overlay: {
            warnings: true,
            errors: true
        }
    });
}

function start(env) {
    const config = webpackConfig(env);
    const compiler = webpack(config);
    const server = devServer(compiler, env);
    server.listen(env.port, "0.0.0.0", error => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
        console.info(
            chalk`starting dev server on {green ${
                env.https ? "https" : "http"
            }://localhost:${env.port}/} \n`
        );
        return null;
    });

    /* [中断进程, 软件终止信号]监听 ref：https://blog.csdn.net/sufwei/article/details/51610676 */
    ["SIGINT", "SIGTERM"].forEach(signal => {
        process.on(signal, () => {
            server.close();
            process.exit();
        });
    });

    return;
}
exports.module = start;
