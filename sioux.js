/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [43.5523, -96.7243, 12]; // Sioux Falls, SD

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
        scene: 'sioux.yaml',
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
            scene.config.layers['sioux-linear'].enabled = true;
            scene.config.layers['sioux-log'].enabled = false;
            scene.updateConfig();
        });
        gui.log = false;
        gui.add(gui, 'log').listen().onChange(function() {
            gui.log = true;
            gui.linear = false;
            scene.config.layers['sioux-log'].enabled = true;
            scene.config.layers['sioux-linear'].enabled = false;
            scene.updateConfig();
        });
        // gui.labels = false;
        // gui.add(gui, 'labels').onChange(function(value) {
        //     scene.config.global.textvisible = value;
        //     scene.updateConfig();
        // });
        // gui.lines = false;
        // gui.add(gui, 'lines').onChange(function(value) {
        //     scene.config.global.linesvisible = value;
        //     scene.updateConfig();
        // });

        gui.minval = 100;
        gui.add(gui, 'minval', 0, 2500).listen().name("minimum value").onChange(function(value) {
            scene.config.global.minval = value;
            scene.updateConfig({ rebuild: true });
            // scene.rebuild();
        });
        gui.maxval = 20000;
        gui.add(gui, 'maxval', 0, 20000).listen().name("maximum value").onChange(function(value) {
            scene.config.global.maxval = value;
            scene.updateConfig({ rebuild: true });
        });
        gui.detectrange = function() {
            scene.queryFeatures().then(results => {
                var values = [];
                  for (let key in results) { 
                    values.push(results[key].properties.ACRES);
                  }
                var minmax = getminmax(values);
                // var buckets = populationBuckets(values, 6);

                  // console.log(buckets);
                console.log('min, max:', minmax);
                gui.minval = minmax.min;
                scene.config.global.minval = minmax.min;
                gui.maxval = minmax.max;
                scene.config.global.maxval = minmax.max;
                scene.updateConfig();
            })
        };
        gui.add(gui, 'detectrange').name("detect range");
        gui.divisions = 6;
        gui.add(gui, 'divisions', 3, 9).listen().name("divisions").onChange(function(value) {
            gui.divisions = Math.round(value);
            scene.config.global.divisions = Math.round(value);
            scene.updateConfig({ rebuild: true });
        });
    }


function getminmax(values) {
 var min = Infinity;
 var max = 0;
      for (let x in values) { 
        min = Math.min(min, values[x]);
        max = Math.max(max, values[x]);
      }
    return {min: min, max: max};
    
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
