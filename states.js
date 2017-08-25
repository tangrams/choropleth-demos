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
        gui.add(gui, 'linear').onChange(function(value) {
            scene.styles.choropleth.shaders.uniforms.u_log = false;
            scene.requestRedraw();
        });
        gui.log = false;
        gui.add(gui, 'log').onChange(function(value) {
            scene.styles.choropleth.shaders.uniforms.u_log = true;
            scene.requestRedraw();
        });

        gui.u_min = 0.;
        gui.add(gui, 'u_min', 0, 1000).name("minimum value").onChange(function(value) {
            scene.styles.choropleth.shaders.uniforms.u_min = value;
            scene.requestRedraw();
        });
        gui.u_max = 0.;
        gui.add(gui, 'u_max', 0, 1000).name("maximum value").onChange(function(value) {
            scene.styles.choropleth.shaders.uniforms.u_max = value;
            scene.requestRedraw();
        });
        gui.autoexpose = true;
        gui.add(gui, 'autoexpose').name("auto-exposure").onChange(function(value) {
            sliderState(!value);
            if (value) {
                // store slider values
                uminValue = gui.u_min;
                umaxValue = gui.u_max;
                // force widening value to trigger redraw
                lastumax = 0;
                expose();
            } else if (typeof uminValue != 'undefined') {
                // retrieve slider values
                scene.styles.choropleth.shaders.uniforms.u_min = uminValue;
                scene.styles.choropleth.shaders.uniforms.u_max = umaxValue;
                scene.requestRedraw();
                gui.u_min = uminValue;
                gui.u_max = umaxValue;
                updateGUI();
            }
        });
    }
    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            gui = new dat.GUI({ autoPlace: true, hideable: true, width: 300 });
            addGUI();
        });
        layer.addTo(map);
    });

    return map;

}());
