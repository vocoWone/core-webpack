"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var webpack_1 = require("webpack");
var autoprefixer_1 = require("autoprefixer");
var mini_css_extract_plugin_1 = require("mini-css-extract-plugin");
var fork_ts_checker_webpack_plugin_1 = require("fork-ts-checker-webpack-plugin");
var html_webpack_plugin_1 = require("html-webpack-plugin");
var uglifyjs_webpack_plugin_1 = require("uglifyjs-webpack-plugin");
var stylelint_webpack_plugin_1 = require("stylelint-webpack-plugin");
var ts_import_plugin_1 = require("ts-import-plugin");
var optimize_css_assets_webpack_plugin_1 = require("optimize-css-assets-webpack-plugin");
var chalk_1 = require("chalk");
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
function webpackConfig(env) {
    return [
        {
            mode: "production",
            entry: env.src + "/index.tsx",
            output: {
                path: env.output,
                filename: "static/js/[name].[chunkhash:8].js"
            },
            resolve: {
                extensions: [".ts", ".tsx", ".js", ".jsx", ".less"],
                modules: [env.src, "node_modules"]
            },
            devtool: "nosources-source-map",
            bail: true,
            optimization: {
                namedModules: true,
                runtimeChunk: "single",
                splitChunks: {
                    automaticNameDelimiter: "-",
                    maxAsyncRequests: 12
                },
                minimizer: [
                    new uglifyjs_webpack_plugin_1["default"]({
                        cache: true,
                        parallel: true,
                        sourceMap: true,
                        uglifyOptions: {
                            compress: {
                                pure_funcs: ["console.info", "console.debug", "console.time", "console.timeEnd"]
                            }
                        }
                    }),
                    new optimize_css_assets_webpack_plugin_1["default"]({
                        cssProcessorOptions: {
                            map: {
                                inline: false
                            }
                        }
                    }),
                ]
            },
            performance: env.performance || {
                maxEntrypointSize: 720000 /* 实际大小700kb（单位换算后），module大小包含 html/css/js/图片流，不包括独立生成的图片，导入的异步模块会单独生成一个新的module（ import() ） */,
                maxAssetSize: 1000000
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx)$/,
                        include: [env.src],
                        loader: "ts-loader",
                        options: {
                            configFile: env.tsConfig,
                            transpileOnly: true,
                            getCustomTransformers: function () { return ({
                                before: [ts_import_plugin_1["default"]({ libraryName: "antd", libraryDirectory: "es", style: true })]
                            }); }
                        }
                    },
                    {
                        test: /\.(css|less)$/,
                        use: [
                            mini_css_extract_plugin_1["default"].loader,
                            {
                                loader: "css-loader",
                                options: {
                                    sourceMap: true,
                                    importLoaders: 2
                                }
                            },
                            {
                                loader: "postcss-loader",
                                options: {
                                    sourceMap: true,
                                    plugins: function () { return [autoprefixer_1["default"]]; }
                                }
                            },
                            {
                                loader: "less-loader",
                                options: {
                                    javascriptEnabled: true,
                                    sourceMap: true
                                }
                            },
                        ]
                    },
                    {
                        test: /\.(png|jpe?g|gif|webp)$/,
                        loader: "url-loader",
                        query: {
                            limit: env.imgLimit || 1024,
                            name: "static/img/[name].[hash:8].[ext]"
                        }
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/,
                        loader: "file-loader",
                        options: {
                            name: "static/font/[name].[hash:8].[ext]"
                        }
                    },
                    {
                        test: /\.mp4$/,
                        loader: "file-loader",
                        options: {
                            name: "static/mp4/[name].[hash:8].[ext]"
                        }
                    },
                ]
            },
            plugins: [
                new mini_css_extract_plugin_1["default"]({
                    filename: "static/css/[name].[contenthash:8].css"
                }),
                new fork_ts_checker_webpack_plugin_1["default"]({
                    tsconfig: env.tsConfig,
                    tslint: env.tslintConfig,
                    workers: fork_ts_checker_webpack_plugin_1["default"].TWO_CPUS_FREE
                }),
                new stylelint_webpack_plugin_1["default"]({
                    configFile: env.stylelintConfig,
                    context: env.src,
                    files: ["**/*.less"],
                    syntax: "less"
                }),
                new html_webpack_plugin_1["default"]({
                    template: env.src + "/index.html",
                    minify: {
                        collapseBooleanAttributes: true,
                        collapseInlineTagWhitespace: true,
                        collapseWhitespace: true,
                        includeAutoGeneratedTags: false,
                        keepClosingSlash: true,
                        minifyCSS: true,
                        minifyJS: true,
                        minifyURLs: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        removeTagWhitespace: true,
                        useShortDoctype: true
                    }
                }),
                new webpack_1["default"].ProgressPlugin(),
            ]
        },
    ];
}
function spawn(command, params, errorMessage) {
    var isWindows = process.platform === "win32"; /* spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux */
    var result = child_process_1["default"].spawnSync(isWindows ? command + ".cmd" : command, params, { stdio: "inherit" });
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk_1["default"](templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["{red.bold ", "}"], ["{red.bold ", "}"])), errorMessage));
        console.error("non-zero exit code returned, code=" + result.status + ", command=" + command + " " + params.join(" "));
        process.exit(1);
    }
}
function build(env) {
    /* clear console */
    process.stdout.write(process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H");
    console.info(chalk_1["default"](templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["{green.bold [task]} {white.bold check code style}"], ["{green.bold [task]} {white.bold check code style}"]))));
    spawn("prettier", ["--config", "" + env.prettierConfig, "--list-different", "{" + env.src + ",test}/**/*.{ts,tsx,less}"], "check code style failed, please format above files");
    console.info(chalk_1["default"](templateObject_3 || (templateObject_3 = tslib_1.__makeTemplateObject(["{green.bold [task]} {white.bold cleanup ", "}"], ["{green.bold [task]} {white.bold cleanup ", "}"])), env.output));
    fs_extra_1["default"].emptyDirSync(env.output);
    console.info(chalk_1["default"](templateObject_4 || (templateObject_4 = tslib_1.__makeTemplateObject(["{green.bold [task]} {white.bold copy ", " folder to ", "}"], ["{green.bold [task]} {white.bold copy ", " folder to ", "}"])), env.contentBase, env.output));
    fs_extra_1["default"].copySync(env.contentBase, env.output, { dereference: true });
    console.info(chalk_1["default"](templateObject_5 || (templateObject_5 = tslib_1.__makeTemplateObject(["{green.bold [task]} {white.bold webpack}"], ["{green.bold [task]} {white.bold webpack}"]))));
    var config = webpackConfig(env);
    var compiler = webpack_1["default"](config);
    compiler.run(function (error, stats) {
        if (env.buildError) {
            env.buildError(error, stats);
            return;
        }
        if (error) {
            console.error(error.stack || error);
            if (error.details) {
                console.error(error.details);
            }
            process.exit(1);
        }
        else {
            var statsJSON = stats.toJson();
            if (env.profile) {
                console.info(chalk_1["default"](templateObject_6 || (templateObject_6 = tslib_1.__makeTemplateObject(["{green.bold [task]} write stats.json"], ["{green.bold [task]} write stats.json"]))));
                fs_extra_1["default"].writeFileSync("stats.json", JSON.stringify(statsJSON, null, 2));
            }
            if (statsJSON.errors.length) {
                console.error(chalk_1["default"](templateObject_7 || (templateObject_7 = tslib_1.__makeTemplateObject(["{red.bold \n", " Error(s) Occurred:}\n"], ["{red.bold \\n", " Error(s) Occurred:}\\n"])), statsJSON.errors.length));
                console.error(chalk_1["default"](templateObject_8 || (templateObject_8 = tslib_1.__makeTemplateObject(["{red.bold ", "}"], ["{red.bold ", "}"])), statsJSON.errors.join("\n\n")));
                process.exit(1);
            }
            else if (statsJSON.warnings.length) {
                /* Ignore "Conflicting order between" warning, produced by "mini-css-extract-plugin" */
                var warnings = statsJSON.warnings.filter(function (_) { return _.indexOf("[mini-css-extract-plugin]\nConflicting order between") < 0; });
                if (warnings.length > 0) {
                    console.error(chalk_1["default"](templateObject_9 || (templateObject_9 = tslib_1.__makeTemplateObject(["{red.bold \n", " Warning(s) Occurred:}\n"], ["{red.bold \\n", " Warning(s) Occurred:}\\n"])), warnings.length));
                    console.error(chalk_1["default"](templateObject_10 || (templateObject_10 = tslib_1.__makeTemplateObject(["{red.bold ", "}"], ["{red.bold ", "}"])), warnings.join("\n\n")));
                    process.exit(1);
                }
            }
            console.info(chalk_1["default"](templateObject_11 || (templateObject_11 = tslib_1.__makeTemplateObject(["{white.bold Build successfully}"], ["{white.bold Build successfully}"]))));
        }
    });
    return;
}
exports["default"] = build;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
