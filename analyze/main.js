/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [39.681, -95.358, 5]; // US

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
        gui.labels = false;
        gui.add(gui, 'labels').onChange(function(value) {
            scene.config.global.textvisible = value;
            scene.updateConfig();
        });
        gui.minval = 0;
        gui.add(gui, 'minval', 0, 200).listen().name("minimum value").onChange(function(value) {
            scene.config.global.minval = value;
            scene.updateConfig({ rebuild: true });
            // scene.rebuild();
        });
        gui.maxval = 200;
        gui.add(gui, 'maxval', 0, 200).listen().name("maximum value").onChange(function(value) {
            scene.config.global.maxval = value;
            scene.updateConfig({ rebuild: true });
        });
        gui.detectrange = function() {

            scene.queryFeatures().then(results => {
                var values = [];
                  for (let key in results) { 
                    if (typeof results[key].properties.retailspending_pct_usavg !== 'undefined') {
                        values.push(results[key].properties.retailspending_pct_usavg);
                    }
                  }
                var minmax = getminmax(values);
                var buckets = populationBuckets(values, 6);

                  console.log(buckets);
                console.log('min, max:', minmax);
                gui.minval = minmax.min;
                scene.config.global.minval = minmax.min;
                gui.maxval = minmax.max;
                scene.config.global.maxval = minmax.max;
                scene.updateConfig();
            })
        };
        gui.add(gui, 'detectrange').name("detect range");
        gui.getprops = function() {
            gui.add(gui, 'property', scene.config.global.props).onChange(function(value) {
                scene.config.global.whichproperty = value;
                scene.updateConfig({ rebuild: true });
            });
            // scene.updateConfig();
        };
        gui.add(gui, 'getprops').name("get properties");
        gui.colors = 6;
        gui.add(gui, 'colors', 3, 9).listen().onChange(function(value) {
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

function populationBuckets(data, bucketCount, min, max) {
    var i = 0, l = data.length;
    // If min and max are given, set them to the highest and lowest data values
    if (typeof min === 'undefined') {
        min = Infinity;
        max = -Infinity;
        for (i = 0; i < l; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
    }
    var inc = (max - min) / bucketCount,
        buckets = new Array(bucketCount);
    // Initialize buckets
    for (i = 0; i < bucketCount; i++) {
        buckets[i] = [];
    }
    // Put the numbers into buckets
    for (i = 0; i < l; i++) {
        // Buckets include the lower bound but not the higher bound, except the top bucket
        if (data[i] === max) buckets[bucketCount-1].push(data[i]);
        else buckets[((data[i] - min) / inc) | 0].push(data[i]);
    }
    return buckets;
}


    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            gui = new dat.GUI({ autoPlace: true, hideable: true, width: 300 });
            addGUI();
            gui.property = 'retailspending_pct_usavg';
        });
        layer.addTo(map);
    });

    return map;

}());
function test() {
    console.log('test');
}
