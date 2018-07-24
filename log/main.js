/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [1.117, -0.235, 7];

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map',
        {"keyboardZoomOffset" : .05}
    );

    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://github.com/tangrams/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;
    // setView expects format ([lat, long], zoom)
    map.setView(map_start_location.slice(0, 3), map_start_location[2]);

    var hash = new L.Hash(map);

    // Create dat GUI
    var gui;
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 1000; // make sure GUI is on top of map
        window.gui = gui;
        gui.linear = false;
        gui.add(gui, 'linear').listen().onChange(function() {
            gui.linear = true;
            gui.log = false;
            scene.config.layers['test-linear'].enabled = true;
            scene.config.layers['test-log'].enabled = false;
            scene.updateConfig();
        });
        gui.log = true;
        gui.add(gui, 'log').onChange(function() {
            gui.log = true;
            gui.linear = false;
            scene.config.layers['test-log'].enabled = true;
            scene.config.layers['test-linear'].enabled = false;
            scene.updateConfig();
        }).listen();

        gui.u_min = 0;
        gui.add(gui, 'u_min', 0, 32).name("minimum value").onChange(function(value) {
            scene.config.global.minval = value;
            scene.updateConfig();
        });
        gui.u_max = 32;
        gui.add(gui, 'u_max', 0, 100000).name("maximum value").onChange(function(value) {
            scene.config.global.maxval = value;
            scene.updateConfig();
        });
    }
    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            gui = new dat.GUI({ autoPlace: true, hideable: true, width: 300 });
            addGUI();
            // console.log('main test:', testcolor)
        });
        layer.addTo(map);
    });

    return map;

}());
