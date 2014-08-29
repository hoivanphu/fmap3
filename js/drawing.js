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
            icon: 'https://cloud.githubusercontent.com/assets/5644842/4071245/bb23e704-2e6c-11e4-9387-bd3a1636cc05.png',
            editable: true,
            draggable: true
        },
        circleOptions: {
            fillColor: '#fa033d',
            fillOpacity: 0.1,
            strokeWeight: 1,
            clickable: true,
            editable: false,
            zIndex: 1
        },
        polylineOptions: {                        
            clickable: true,
            editable: false            
        },
        polygonOptions: {
            clickable: true,
            editable: false
        }
    });

    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (circle) {        
        var bts = new google.maps.Marker({
            position: circle.getCenter(),
            map: map,
            draggable: true,
            icon: "https://cloud.githubusercontent.com/assets/5644842/4071245/bb23e704-2e6c-11e4-9387-bd3a1636cc05.png"
        });
        circle.bindTo('center', bts, 'position');
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        var type = event.type;
        if (type == "marker") {
            gMarker = null;
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                div_show(true);     				
            });
        } else if (type == "circle") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                div_show(true);                  
				this.setEditable(false);
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {                
                this.setEditable(true);
            });
        } else if (type == "polyline") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                div_show(true);  
				this.setEditable(false);
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {                
                this.setEditable(true);				
            });
        } else if (type == "polygon") {
            google.maps.event.addListener(event.overlay, 'click', function (e) {
                div_show(true);      
				this.setEditable(false);				
            });
            google.maps.event.addListener(event.overlay, 'rightclick', function (e) {                
                this.setEditable(true);
            });
        }
    });
}
