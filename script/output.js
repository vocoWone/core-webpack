const chalk = require("chalk");
const childProcess = require("child_process");
const fs = require("fs-extra");

function spawn(command, args, errorMessage) {
    const isWindows = process.platform === "win32"; // spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux
    const result = childProcess.spawnSync(isWindows ? command + ".cmd" : command, args, {stdio: "inherit"});
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk`{red.bold ${errorMessage}}`);
        console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${args.join(" ")}`);
        process.exit(1);
    }
}

function checkCodeStyle() {
    console.info(chalk`{green.bold [task]} {white.bold check code style}`);
    return spawn("prettier", ["--config", "config/prettier.json", "--list-different", "src/**/*.{ts,tsx,js}"], "check code style failed, please format above files");
}

// function test() {
//     console.info(chalk`{green.bold [task]} {white.bold test}`);
//     return spawn("jest", ["--config", "config/jest.json"], "test failed, please fix");
// }

function lint() {
    console.info(chalk`{green.bold [task]} {white.bold lint}`);
    return spawn("tslint", ["-c", "config/tslint.json", "{src,test}/**/*.{ts,tsx}"], "lint failed, please fix");
}

function cleanup() {
    console.info(chalk`{green.bold [task]} {white.bold cleanup}`);
    fs.emptyDirSync("output");
}

function compile() {
    console.info(chalk`{green.bold [task]} {white.bold compile}`);
    return spawn("tsc", ["-p", "config/tsconfig.json"], "compile failed, please fix");
}

function distribute() {
    console.info(chalk`{green.bold [task]} {white.bold distribute}`);
    fs.mkdirsSync("output/dist/lib");
    fs.copySync("output/out/src", "output/dist/lib/", {dereference: true});
    fs.copySync("package.json", "output/dist/package.json", {dereference: true});
}

function removeDefault() {
    console.info(chalk`{green.bold [task]} {white.bold remove default}`);

    const devFile = fs.readFileSync("output/dist/lib/webpack.config.dev.js");
    const newDevFile = devFile.toString().replace(/\[\"default\"\]/g, "");
    fs.writeFileSync("output/dist/lib/webpack.config.dev.js", newDevFile);

    const buildFile = fs.readFileSync("output/dist/lib/webpack.config.build.js");
    const newBuildFile = buildFile.toString().replace(/\[\"default\"\]/g, "");
    fs.writeFileSync("output/dist/lib/webpack.config.build.js", newBuildFile);
}

function output() {
    cleanup();
    checkCodeStyle();
    // test();
    lint();
    compile();
    distribute();
    removeDefault();
}

output();
