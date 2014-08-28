//chuyển chuỗi sang tọa độ
function convert_string_latlng(sLatLng){
    sLatLng=sLatLng.replace("(", "").replace(")", "");
    var arrLatLng=sLatLng.split(",");
    var pointLatLng=new google.maps.LatLng(arrLatLng[0],arrLatLng[1]);
    return pointLatLng;
}

//
function loadXMLDoc(dname)
{
    if (window.XMLHttpRequest){
        xhttp=new XMLHttpRequest();
    }
    else{
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",dname,false);
    xhttp.send("");
    return xhttp.responseXML;
}

function loadXMLString(txt) {
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(txt, "text/xml");
    }
    else // code for IE
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(txt);
    }
    return xmlDoc;
}

//đọc file xml
function load(){         
    xmlDoc=loadXMLDoc("XML/Marker.xml");
    x=xmlDoc.getElementsByTagName("Marker");            
    for (i=0; i<x.length; i++)
    {
        for(j=0; j<x[i].childNodes.length; j++)
        {
            var LatLng=x[i].childNodes[j].nodeName;
            if (x[i].childNodes[j].nodeType==1 && LatLng=="LatLng")
            {             
                var sLatLng=x[i].childNodes[j].childNodes[0].nodeValue;                
                var point=convert_string_latlng(sLatLng);
                marker=new google.maps.Marker({position: point, map: map});
            }
        }
    }
}


var gMarker = null;
var gMarkers = new Array();
var tooltips = new Object(); 

function add_marker(id, name, parent, type, latlng) {
    var scrImage = "Images/";
    if (type == "1")
        scrImage += "pop.png";
    else if (type == "2")
        scrImage += "tc.png";
    else if (type == "3")
        scrImage += "hc.png";
    var point = convert_string_latlng(latlng);
    var marker = new google.maps.Marker({ position: point, map: map, draggable: true, icon: scrImage, tilte:name });
    marker.id = id;
    marker.name = name;
    marker.parent = parent;
    marker.type = type;
    marker.url = "Images/devices/"+type+".jpg";
    
    var chTooltipHtml = "<div>" + name + "</div>";
    var tooltipOptions = { marker: marker, content: chTooltipHtml, cssClass: 'tooltip' };  // name of a css class to apply to tooltip 
    tooltips[id] = new Tooltip(tooltipOptions);

    google.maps.event.addListener(marker, "click", function () {
        gMarker = this;
        view_popup_link(true);
        document.getElementById("imgDevice").src = this.url;
        //panorama
        var panoOptions = {
            pano: 'reception',
            visible: true,
            panoProvider: getCustomPanorama
        };
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), panoOptions);
        //end panorama				 
    })
    gMarkers.push(marker);
}

function add_device(action) {
    var type = document.getElementById("slDeviceType").value;
    var parent = document.getElementById("slParentDevice").value;
    var name = document.getElementById("txtDeviceName").value;
    var url = "";
    if (action == "OK") {
        url = "Default.aspx?action=AddDevice&name=" + name + "&parent=" + parent + "&latlng=" + gLatLng + "&type=" + type + "&ID=" + Math.random();
        downloadUrl(url, function (data) {
            var markers = data.getElementsByTagName("marker");
            var id = "";
            for (var i = 0; i < markers.length; i++) {
                id = markers[i].getAttribute("id"); break;
            }
            add_marker(id, name, parent, type, gLatLng.toString());
            view_popup_link(false);
        });
    } else {
        url = "Default.aspx?action=UpdateDevice&deviceID=" + gMarker.id + "&name=" + name + "&parent=" + parent + "&latlng=" + gMarker.getPosition() + "&type=" + type + "&ID=" + Math.random();
        downloadUrl(url, function (data) {
            document.getElementById("btnNew").value = "OK";    
            view_popup(false);
            init();
        });
    }
}

function delete_device() {    
    var url = "Default.aspx?action=DeleteDevice&DeviceID=" +gMarker.id + "&ID=" + Math.random();
    downloadUrl(url, function (data) {
        view_popup_link(false);
        init();
    });
}

function update_device() {
    view_popup(true);
    load_parent_devices(gMarker.type);
    document.getElementById("slDeviceType").selectedIndex = gMarker.type -1;        
    document.getElementById("txtDeviceName").value = gMarker.name;
    document.getElementById("btnNew").value = "Update";
  
}

function load_devices() {
    var id = "";
    var parent = "";
    var name = "";
    var type = "";
    var latlng = "";        
    var url="Default.aspx?action=LoadDevice&ID="+Math.random();
    downloadUrl(url, function (data) {
        var markers = data.getElementsByTagName("marker");
        for (var i = 0; i < markers.length; i++) {
            id = markers[i].getAttribute("id");
            name = markers[i].getAttribute("name");
            parent = markers[i].getAttribute("parent");
            type = markers[i].getAttribute("type");
            latlng = markers[i].getAttribute("latlng");            
            add_marker(id, name, parent, type, latlng);            
        }        
    });
}
////////////////////////
var gLatLng = null;
function load_parent_devices(type) {
    var sl = '<option value="0">- - - - - - - - - -</option>';
    
    if (type > 1) {
        var url = "Default.aspx?action=DeviceParent&Type=" + type + "&ID=" + Math.random();
        downloadUrl(url, function (data) {
            var markers = data.getElementsByTagName("marker");            
            for (var i = 0; i < markers.length; i++) {
                id = markers[i].getAttribute("id");
                name = markers[i].getAttribute("name");
                if (gMarker!=null && gMarker.parent == id) {
                    sl += '<option value="' + id + '" selected="selected">' + name + '</option>';
                } else {
                    sl += '<option value="' + id + '">' + name + '</option>';
                }
            }
            document.getElementById("slParentDevice").innerHTML = sl;
        });
    } else {
        document.getElementById("slParentDevice").innerHTML = sl;
    }
}

//////////////////////LINK/////////////////
var gPolys = [];
function get_link(action) {
    delete_polys();
    var type, latlngDevice, latlngParent;
    var points = Array();
    
    var url = "Default.aspx?action="+ action+"&deviceID="+gMarker.id+"&ID=" + Math.random();
    downloadUrl(url, function (data) {
        var polys = data.getElementsByTagName("poly");
        for (var i = 0; i < polys.length; i++) {
            type = polys[i].getAttribute("type");
            latlngDevice = polys[i].getAttribute("latlngDevice");
            latlngParent = polys[i].getAttribute("latlngParent");
            var poly = draw_poly(type, latlngDevice, latlngParent)
            gPolys.push(poly);
        }
    });
    view_popup_link(false);
}

var beginDevice = null;
var endDevice = null;
function from_here() {
    beginDevice = gMarker;
    view_popup_link(false);
}
function get_path(action) {
    endDevice = gMarker;
    delete_polys();
    var points = [];
    var url = "Default.aspx?action=" + action + "&beginDevice=" + beginDevice.id + "&endDevice=" + endDevice.id;
    url += "&beginLatLng=" + beginDevice.getPosition() + "&endLatLng=" + endDevice.getPosition() + "&ID=" + Math.random();
    downloadUrl(url, function (data) {
        var polys = data.getElementsByTagName("poly");
        var arrLatLng = polys[0].getAttribute("latlng").split(';');
        for (var i = 0; i < arrLatLng.length - 1; i++) {
            points.push(convert_string_latlng(arrLatLng[i]))
        }
        var poly = new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: "#FF00FF",
            strokeOpacity: 1.0,
            strokeWeight: 1
        });
        poly.setMap(map);
        gPolys.push(poly);
    });
    nameBegin = null;
    nameEnd = null;
    view_popup_link(false);
}

function draw_poly(type, point1, point2) {    
    var points = [];
    points.push(convert_string_latlng(point1));
    points.push(convert_string_latlng(point2));
    var color = "#FF0000";
    if(type == "2")
        color = "#FF00FF";
    else if(type == "3")
        color = "#4C7FF5";    
    var poly=new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 1
    });
    poly.setMap(map);
    google.maps.event.addListener(poly, "click", function (e) {
        this.setEditable(true);
    });
    google.maps.event.addListener(poly, "mouseover", function (e) {
        //this.setEditable(true);
    });
    google.maps.event.addListener(poly, "mouseout", function () {        
           // this.setEditable(false);        
    });    
    return poly;
}
function delete_polys() {
    if (gPolys.length > 0) {
        for (var i = 0; i < gPolys.length; i++) {
            gPolys[i].setMap(null);
        }
        gPolys = [];
    }
}
