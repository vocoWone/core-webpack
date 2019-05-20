const webpack = require("webpack");
const chalk = require("chalk");
const fs = require("fs-extra");

function webpackConfig(env) {
    return [
        {
            mode: "production",
            entry: env.entry,
            output: env.output,
            resolve: env.resolve,
            devtool: "nosources-source-map",
            bail: true,
            optimization: env.optimization,
            performance: env.performance,
            module: {
                rules: env.loaders,
            },
            plugins: [...env.plugins, new webpack.ProgressPlugin()],
        },
    ];
}

function build(env) {
    const config = webpackConfig(env);
    const compiler = webpack(config);
    compiler.run((error, stats) => {
        if (error) {
            console.error(error.stack || error);
            if (error.details) console.error(error.details);
            process.exit(1);
        } else {
            const statsJSON = stats.toJson();
            if (env.profile) {
                console.info(chalk`{green.bold [task]} write stats.json`);
                fs.writeFileSync("stats.json", JSON.stringify(statsJSON, null, 2));
            }

            if (statsJSON.errors.length) {
                console.error(chalk`{red.bold \n${statsJSON.errors.length} Error(s) Occurred:}\n`);
                console.error(chalk`{red.bold ${statsJSON.errors.join("\n\n")}}`);
                process.exit(1);
            } else if (statsJSON.warnings.length) {
                // Ignore "Conflicting order between" warning, produced by "mini-css-extract-plugin"
                const warnings = statsJSON.warnings.filter(_ => _.indexOf("[mini-css-extract-plugin]\nConflicting order between") < 0);
                if (warnings.length > 0) {
                    console.error(chalk`{red.bold \n${warnings.length} Warning(s) Occurred:}\n`);
                    console.error(chalk`{red.bold ${warnings.join("\n\n")}}`);
                    process.exit(1);
                }
            }

            console.info(chalk`{white.bold Build successfully}`);
        }
    });

    return;
}

module.exports = build;
