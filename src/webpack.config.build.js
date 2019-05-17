const webpack = require("webpack");
const chalk = require("chalk");
const childProcess = require("child_process");
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

function spawn(command, params, errorMessage) {
    const isWindows = process.platform === "win32"; /* spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux */
    const result = childProcess.spawnSync(isWindows ? command + ".cmd" : command, params, {stdio: "inherit"});
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk`{red.bold ${errorMessage}}`);
        console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${params.join(" ")}`);
        process.exit(1);
    }
}

function build(env) {
    /* clear console */
    process.stdout.write(process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H");
    console.info(chalk`{green.bold [task]} {white.bold check code style}`);
    spawn("prettier", ["--config", `${env.prettierConfig}`, "--list-different", `{${env.src},test}/**/*.{ts,tsx,less}`], "check code style failed, please format above files");

    console.info(chalk`{green.bold [task]} {white.bold cleanup ${env.output}}`);
    fs.emptyDirSync(env.output);

    console.info(chalk`{green.bold [task]} {white.bold copy ${env.contentBase} folder to ${env.output}}`);
    fs.copySync(env.contentBase, env.output, {dereference: true});

    console.info(chalk`{green.bold [task]} {white.bold webpack}`);
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

exports.module = build;
