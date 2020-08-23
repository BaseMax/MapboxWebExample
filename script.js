var status=1;
var coordinates=document.querySelector(".coordinates");
mapboxgl.accessToken = 'pk.eyJ1IjoiYmFzZW1heCIsImEiOiJjazJ6ZXk2MmUwZXhlM25tbWlyZWxqcTdhIn0.ZyFIa0kLsOs4udQKFZL_FQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [15.6151221, 58.408346], // Bug: api show 0 distance and duration!
  zoom: 12,
  steps: false,
  geometries: 'polyline',
  controls: { instructions: false }
});
var startMarker = new mapboxgl.Marker()
  .setLngLat([15.6151221, 58.408346]) // Bug
  .addTo(map);
var endMarker;

// var bounds = [
//   [-74.04728, 40.68392], // [west, south]
//   [-73.91058, 40.87764]  // [east, north]
// ];
// map.setMaxBounds(bounds);

var canvas = map.getCanvasContainer();

function onDragEnd() {
  var center = map.getCenter();
  coordinates.style.display = 'block';
  coordinates.innerHTML = 'Longitude: ' + startMarker.getLngLat().lng + '<br>Latitude: ' + startMarker.getLngLat().lat;
  if(endMarker != undefined) {
    coordinates.innerHTML += '<br>Longitude: ' + endMarker.getLngLat().lng + '<br>Latitude: ' + endMarker.getLngLat().lat;
  }
  if(status == 1) {
    startMarker.setLngLat(center);
  }
  else if(status == 2) {
    endMarker.setLngLat(center);
  }
}
map.on('move', onDragEnd);

function press() {
  if(status == 1) {
    let latlng=startMarker.getLngLat();
    endMarker = new mapboxgl.Marker()
      .setLngLat({lat:latlng.lat+0.01, lng:latlng.lng-0.01})
      // .setLngLat({lat:latlng.lat, lng:latlng.lng})
      .addTo(map);
    status=2;
  }
  else if(status == 2) {
    alert("Done");
    getRoute();
    status=3;
  }
}

function getRoute() {
  var startPoint=startMarker.getLngLat().lat+','+startMarker.getLngLat().lng;
  var endPoint=endMarker.getLngLat().lat+','+endMarker.getLngLat().lng;
  var url= 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/'+
    startPoint+
    ';' +
    endPoint+
    '?steps=true&geometries=geojson&access_token='+mapboxgl.accessToken;
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function() {
    var json = JSON.parse(req.response);
    console.log(json);
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': route
      }
    };
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    }
    else {
      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': geojson
            }
          }
        },
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    var steps = data.legs[0].steps;
    // console.log(data);
    alert(Math.floor(data.duration / 60) + " min");
    alert(data.distance + " meters");

  };
  req.send();
}
