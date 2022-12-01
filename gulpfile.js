import g from "gulp";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cleanCSS from "gulp-clean-css";
import image from "gulp-image";
import mocha from "gulp-mocha";

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
function moveJS() {
    return g.src("dev/js/*").pipe(g.dest("dist/js"));
}
function moveConfig() {
    return g.src("dev/config.json*").pipe(g.dest("dist/"));
}

export default g.series(
    g.parallel(
        moveHTML,
        moveJS,
        moveConfig,
        optimizeImg,
        g.series(autoprefix, minifyCSS)
    ),
    testAll
);

export { testAll };
