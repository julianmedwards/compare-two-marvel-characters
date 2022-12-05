import g from "gulp";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cleanCSS from "gulp-clean-css";
import image from "gulp-image";
import mocha from "gulp-mocha";

import webpack from "webpack-stream";
import through from "through2";
import * as webpackCfg from "./webpack.config.js";

function autoprefix() {
    return g
        .src("dev/css/*.css")
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write("."))
        .pipe(g.dest("build/css/"));
}

function minifyCSS() {
    return g
        .src("build/css/*.css")
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("."))
        .pipe(g.dest("dist/css/"));
}

// Optimize images
function optimizeImg() {
    return g.src("dev/img/*").pipe(image()).pipe(g.dest("dist/img"));
}

// Run tests
function testAll() {
    return g.src("dev/test/*.test.js", { read: false }).pipe(
        mocha({ reporter: "min" }).on("error", (err) => {
            console.error(err);
        })
    );
}

// Move HTML to distribution
function moveHTML() {
    return g.src("dev/index.html").pipe(g.dest("dist"));
}
function moveConfig() {
    return g.src("dev/config.json*").pipe(g.dest("dist/"));
}

function webpackJS() {
    return g
        .src("dev/js/load.js")
        .pipe(
            webpack({
                mode: "production",
                devtool: "source-map",
            })
        )
        .pipe(g.dest("dist/js/"));
}

export default g.series(
    g.parallel(
        moveHTML,
        webpackJS,
        moveConfig,
        optimizeImg,
        g.series(autoprefix, minifyCSS)
    ),
    testAll
);

export { testAll };
