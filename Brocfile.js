/*jslint node: true*/
'use strict';

var mergeTrees     = require('broccoli-merge-trees'),
    unwatchedTree  = require('broccoli-unwatched-tree'),
    pickModules    = require('broccoli-js-module-format'),
    compileModules = require('broccoli-es6-module-transpiler'),
    graphModules   = require('broccoli-es-dependency-graph'),
    cssWithMQs     = require('./lib/css-with-mqs'),
    stripMQs       = require('./lib/css-strip-mqs'),
    mapFiles       = require('./lib/map-files');

var bower_components = unwatchedTree('bower_components/'),
    node_modules     = unwatchedTree('node_modules/');

var vendor = mergeTrees([
    mapFiles(bower_components, {
        'rainbow/js/': 'vendor/rainbow/'
    }),

    mapFiles(node_modules, {
        'css-mediaquery/index.js'              : 'vendor/css-mediaquery.js',
        'handlebars/dist/handlebars.runtime.js': 'vendor/handlebars.runtime.js'
    })
]);

var pub = 'public/';
var esModules = pickModules(pub, {
    type: 'es'
});

// Calculate the ES6 module dependency graph.
var depGraph = graphModules(esModules, {
    includeBindings: true,
    dest: 'graph.json'
});

// Compile ES6 Modules in `pub`.
esModules = compileModules(esModules, {
    type: 'yui'
});

// Strip Media Queries from CSS files and save copy as "-old-ie.css".
var oldIECSS = stripMQs(cssWithMQs(pub), {suffix: '-old-ie'});

// Export merged trees.
module.exports = mergeTrees([vendor, pub, oldIECSS, esModules, depGraph], {
    overwrite: true
});
