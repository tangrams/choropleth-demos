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
        scene: 'scene.yaml',
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
        gui.color = "#ffae23"; // CSS string
        gui.addColor(gui, 'color').onChange(function(value) {
            // console.log(hexToRgb(value));
            scene.config.global.color = value;
            scene.updateConfig();
        });
        gui.brightness = 0.;
        gui.add(gui, 'brightness', -1., 1.).listen().onChange(function(value) {
            scene.config.global.brightness = value;
            scene.updateConfig();
        });
        gui.saturation = 0.;
        gui.add(gui, 'saturation', -1, 1).listen().onChange(function(value) {
            scene.config.global.saturation = value;
            scene.updateConfig();
        });
        gui.divisions = 6;
        gui.add(gui, 'divisions', 2, 10).listen().onChange(function(value) {
            scene.config.global.divisions = parseInt(value);
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
