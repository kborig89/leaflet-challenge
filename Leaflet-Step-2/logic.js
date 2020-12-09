// Store our API endpoint inside queryUrl
var sigEarthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL
d3.json(sigEarthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function getColor(magnitude) {
  return  magnitude > 5  ? 'tomato' :
          magnitude > 4  ? 'lightcoral' :
          magnitude > 3  ? 'violet' :
          magnitude > 2  ? 'palegreen' :
          magnitude > 1  ? 'peachpuff' :
                           'blue' ;
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Magnitude:" +feature.properties.mag + "<br>"+ feature.properties.place +"<br>"+
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlong) {
      return new L.CircleMarker( latlong, {
        radius: feature.properties.mag * 3,
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        weight: 1,
        color: "black"
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetview = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street View": streetview,
    "Satellite": satellite,
    "Light Map": lightmap
  };

  // Create tectonic plate layer
  var tectPlate = new L.LayerGroup();


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tetonic: tectPlate
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [streetview, satellite, earthquakes]
  });


 // Perform a GET request to the query URL
d3.json(tectonicPlatesURL, function(tectonicData) {
  L.geoJSON(tectonicData, {
  pointToLayer: function(feature, latlong) {
    return new L.CircleMarker( latlong, {
      radius: feature.properties.mag * 3,
      fillOpacity: 1,
      weight: 1,
      color: "yellow"
    });
  },
  .addTo(tectPlate),
});

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Set up the legend
var legend = L.control({ position: "bottomleft" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var grades = [5, 4, 3, 2, 1, 0];
      var colors = [
        'tomato',
        'lightcoral',
        'violet',
        'palegreen',
        'peachpuff',
        'blue'
      ];
  
      // Looping through
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };


// Adding legend to the map
legend.addTo(myMap);


// //Create radius function
function getRadius(magnitude) {
    return magnitude * 3;
};