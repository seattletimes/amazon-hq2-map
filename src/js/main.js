// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var $ = require("./lib/qsa");
var dot = require("./lib/dot");
var popup = dot.compile(require("./_popup.html"));

var mapElement = $.one("leaflet-map");
var map = mapElement.map;
var leaflet = mapElement.leaflet;

var filters = {
  all: _ => true,
  unemployment: d => d.unemployment_rate > 5,
  megametro: d => d.metro_population > 1000000,
  tax: d => d.tax_breaks > 100000000
}

var markerLayer = leaflet.featureGroup();
var markers = [];

var onClick = function(e) {
  var marker = e.target;
  var data = marker.data;
  var html = popup(data);
  map.openPopup(html, marker.getLatLng());
};

window.cityData.forEach(function(c) {
  var marker = leaflet.marker([c.lat, c.lng], {
    icon: leaflet.divIcon({
      className: `city-marker ${c.bid_status}`
    })
  });
  c.marker = marker;
  marker.data = c;
  marker.on("click", onClick);
  marker.addTo(markerLayer);
  markers.push(marker);
});

markerLayer.addTo(map);

map.fitBounds(markerLayer.getBounds());

var onChange = function() {
  var filterName = $(`input[name="filter"]`).filter(el => el.checked).pop().id;
  var filter = filters[filterName];
  markers.forEach(function(m) {
    var match = filter(m.data);
    if (match) {
      m.addTo(markerLayer);
    } else {
      markerLayer.removeLayer(m);
    }
  });
};

$.one(".filters").addEventListener("change", onChange);
onChange();