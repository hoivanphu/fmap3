/////////////////// Create Drawing Library//////////////
function add_darawing() {
    alert("save successfully!");
    view_drawing(false);
}

function drawing_libary() {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
				    google.maps.drawing.OverlayType.MARKER,
				    google.maps.drawing.OverlayType.CIRCLE,
				    google.maps.drawing.OverlayType.POLYGON,
				    google.maps.drawing.OverlayType.POLYLINE,
				    google.maps.drawing.OverlayType.RECTANGLE
			    ]
        },
        markerOptions: {
            icon: 'images/marker.png',
            editable: true,
            draggable: true
        },
        circleOptions: {
            fillColor: '#fa033d',
            fillOpacity: 0.1,
            strokeWeight: 1,
            clickable: true,
            editable: true,
            zIndex: 1
        },
        polylineOptions: {                        
            clickable: true,
            editable: true            
        },
        polygonOptions: {
            clickable: true,
            editable: true
        }
    });

    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (circle) {        
        var bts = new google.maps.Marker({
            position: circle.getCenter(),
            map: map,
            draggable: true,
            icon: "Images/bts.gif"
        });
        circle.bindTo('center', bts, 'position');
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        var type = event.type;
        if (type == "marker") {
            gMarker = null;
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                view_popup(true);
                gLatLng = this.getPosition();
                this.setMap(null);
                /*view_drawing(true);                
                document.getElementById("txtName").value = "";
                document.getElementById("txtType").value = type;
                document.getElementById("txtLatLng").value = this.getPosition() + "";
                document.getElementById("txtRadius").value = "";*/
            });
        } else if (type == "circle") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                view_drawing(true);
                this.setEditable(false);
                document.getElementById("txtName").value = "";
                document.getElementById("txtType").value = type;
                document.getElementById("txtLatLng").value = this.getCenter() + "";
                document.getElementById("txtRadius").value =Math.round(this.getRadius()) + " m";
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {
                view_drawing(false);
                this.setEditable(true);
            });
        } else if (type == "polyline") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                view_drawing(true);
                this.setEditable(false);
                document.getElementById("txtName").value = "";
                document.getElementById("txtType").value = type;
                var path = this.getPath();
                var sPath = "";
                var polylineLength = 0;
                for (i = 0; i < path.getLength(); i++) {
                    sPath += path.getAt(i) + "; ";
                    if (i > 0) {
                        polylineLength += google.maps.geometry.spherical.computeDistanceBetween(path.getAt(i), path.getAt(i-1));
                    }
                }
                document.getElementById("txtLatLng").value = sPath + "";
                document.getElementById("txtRadius").value = Math.round(polylineLength)+ " m";
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {
                view_drawing(false);
                this.setEditable(true);
            });
        } else if (type == "polygon") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                view_drawing(true);
                this.setEditable(false);
                document.getElementById("txtName").value = "";
                document.getElementById("txtType").value = type;
                var path = this.getPath();
                var sPath = "";
                for (i = 0; i < path.getLength(); i++) {
                    sPath += path.getAt(i) + "; ";
                }
                document.getElementById("txtLatLng").value = sPath + "";
                document.getElementById("txtRadius").value = "";
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {
                view_drawing(false);
                this.setEditable(true);
            });
        }
    });
}
