var styles =
[
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#333739"
            },
            {
                "weight": 0.8
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2ecc71"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "color": "#2ecc71"
            },
            {
                "lightness": -7
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "color": "#2ecc71"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#333739"
            },
            {
                "weight": 0.3
            },
            {
                "lightness": 10
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2ecc71"
            },
            {
                "lightness": -28
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2ecc71"
            },
            {
                "visibility": "on"
            },
            {
                "lightness": -15
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2ecc71"
            },
            {
                "lightness": -18
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2ecc71"
            },
            {
                "lightness": -34
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#333739"
            }
        ]
    }
]
var count = 0
var markers = []
var torrents = []

function initMap() {

  function checkDB(){
    console.log("Checking db")
    $.getJSON("https://aussiepirates.herokuapp.com:3000/db", function( data ) {
      db = data
      data = db.locations

      torrents = db.torrents

      var newMarkers = [];
      for(var i=0; i < data.length; i++){
        newMarker = data[i];
        if (markers.indexOf(newMarker["ip"]) == -1){
          // console.log("New Marker")
          markers.push(newMarker["ip"]);
          newMarkers.push(newMarker);
        } else {
          // console.log("Old Marker")
        }
      }
      drop(newMarkers);
    });
  }

  function CenterControl(controlDiv, map) {

    controlDiv.onclick = function() {
      something = window.open("data:text/json," + encodeURIComponent(markers),
                       "_blank");
       something.focus();
    }

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'People downloading Game of Thrones';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Australians torrenting right now: 0';
    controlText.setAttribute("id", "mainTitle");
    controlUI.appendChild(controlText);

  }

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: {lat: -27.2, lng: 133}
  });
  map.setOptions({styles: styles});

  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  var infowindow = new google.maps.InfoWindow({
    content: "<div id='infoText'></div>"
  });

  function drop(data) {
     for (var i = 0; i < data.length; i++) {
       addMarkerWithTimeout(data[i], i * Math.random()*3 * 0);
     }
   }

   function addMarkerWithTimeout(pin, timeout) {
     window.setTimeout(function() {
       var marker = new google.maps.Marker({
         position: {lat: pin['ll'][0], lng: pin['ll'][1]},
         map: map,
         title: pin['ip'],
         torrentIndex: pin["infoHash"],
         icon: "marker.png",
        //  animation: google.maps.Animation.DROP
       });
       $("#mainTitle").html("Australians torrenting right now:<br>" + count)
       count+=1

        marker.addListener('click', function() {
        console.log(pin['ip'])
        infowindow.open(map, marker);

        var text = "<b>IP: </b>" + marker.title;
        console.log(marker)
        for (attribute in torrents[marker.torrentIndex]){
          if(['url','infoHash'].indexOf(attribute) == -1){
            text = text + "<br><b>" + attribute.charAt(0).toUpperCase() + attribute.slice(1) + ": </b>" + torrents[marker.torrentIndex][attribute];
          }
        }
        $("#infoText").html(text)
});
     }, timeout);
   }
   checkDB();
}
