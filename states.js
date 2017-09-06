/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [37.627, -93.504, 4]; // USA    

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
        scene: 'states.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
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
        gui.linear = true;
        gui.add(gui, 'linear').listen().onChange(function() {
            gui.linear = true;
            gui.log = false;
            scene.config.layers['states-linear'].enabled = true;
            scene.config.layers['states-log'].enabled = false;
            scene.updateConfig();
        });
        gui.log = false;
        gui.add(gui, 'log').listen().onChange(function() {
            gui.log = true;
            gui.linear = false;
            scene.config.layers['states-log'].enabled = true;
            scene.config.layers['states-linear'].enabled = false;
            scene.updateConfig();
        });

        gui.labels = false;
        gui.add(gui, 'labels').onChange(function(value) {
            scene.config.global.textvisible = value;
            scene.updateConfig();
        });

        gui.lines = false;
        gui.add(gui, 'lines').onChange(function(value) {
            scene.config.global.linesvisible = value;
            scene.updateConfig();
        });

        gui.minval = 100;
        gui.add(gui, 'minval', 0, 10000).name("minimum value").onChange(function(value) {
            scene.config.global.minval = value;
            scene.updateConfig();
        });

        gui.maxval = 100000;
        gui.add(gui, 'maxval', 0, 100000).name("maximum value").onChange(function(value) {
            scene.config.global.maxval = value;
            scene.updateConfig();
        });

        gui.divisions = 6;
        gui.add(gui, 'divisions', 3, 9).listen().name("divisions").onChange(function(value) {
            gui.divisions = Math.round(value);
            scene.config.global.divisions = Math.round(value);
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
