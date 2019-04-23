var latitude = [];
var longitude = [];
var CO = [];
var O3 = [];
var PM025 = [];
var prev_degO3 = 90;
var prev_degPM025 = 90;
var flag = 0; // 0: PM2.5, 1: O3
var numClicks = 0;
var gridVals = new Array(84);
for (var i = 0; i < 84; i++) {
  gridVals[i] = new Array(100);
}

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "/static/pollution_map/Interpolated_Map_sample.csv?q=" + Math.random(),
        dataType: "text",
        success: function(data) {
            processData(data);
            numClicks = 0;
        }
     });
});

function processData(allText) {
    var record_num = 5;
    var allTextLines = allText.split(/\r\n|\n/);
    // Ignore the first line
    allTextLines.shift();

    while (allTextLines.length) {
        var entries = allTextLines.shift().split(',');
        latitude.push(parseFloat(entries.shift()));
        longitude.push(parseFloat(entries.shift()));
        CO.push(parseFloat(entries.shift()));
        O3.push(parseFloat(entries.shift()));
        PM025.push(parseFloat(entries.shift()));
    }
}

function o3RadioChecked() {
    var isPM25Arrow = document.getElementById("pm25_arrow");
    if (isPM25Arrow != null) {
        document.getElementById("arrow").innerHTML = "";
    }
    // var isO3Arrow = document.getElementById("o3_arrow");
    // if (isO3Arrow == null) {
    //     var newArrow = document.createElement("div");
    //     newArrow.innerHTML = '<img src="' + "/static/pollution_map/images/blue_arrow.png" + '" class="blue_arrow" id="o3_arrow">';
    //     document.getElementById("arrow").appendChild(newArrow);
    // }
    flag = 1;
}

function pm25RadioChecked() {
    var isO3Arrow = document.getElementById("o3_arrow");
    if (isO3Arrow != null) {
        document.getElementById("arrow").innerHTML = "";
    }
    // var isPM25Arrow = document.getElementById("pm25_arrow");
    // if (isPM25Arrow == null) {
    //     var newArrow = document.createElement("div");
    //     newArrow.innerHTML = '<img src="' + "/static/pollution_map/images/red_arrow.png" + '" class="blue_arrow" id="pm25_arrow">';
    //     document.getElementById("arrow").appendChild(newArrow);
    // }
    flag = 0;
}

function searchPoint(event) {
    if (flag == 1) {
        var isPM25Arrow = document.getElementById("pm25_arrow");
        if (isPM25Arrow != null) {
            document.getElementById("arrow").innerHTML = "";
        }
        var isO3Arrow = document.getElementById("o3_arrow");
        if (isO3Arrow == null) {
            var newArrow = document.createElement("div");
            newArrow.innerHTML = '<img src="' + "/static/pollution_map/images/blue_arrow.png" + '" class="blue_arrow" id="o3_arrow">';
            document.getElementById("arrow").appendChild(newArrow);
        }
    } else if (flag == 0) {
        var isO3Arrow = document.getElementById("o3_arrow");
        if (isO3Arrow != null) {
            document.getElementById("arrow").innerHTML = "";
        }
        var isPM25Arrow = document.getElementById("pm25_arrow");
        if (isPM25Arrow == null) {
            var newArrow = document.createElement("div");
            newArrow.innerHTML = '<img src="' + "/static/pollution_map/images/red_arrow.png" + '" class="red_arrow" id="pm25_arrow">';
            document.getElementById("arrow").appendChild(newArrow);
        }
    }
    var x = event.clientX;
    var y = event.clientY;
    var map = document.getElementById("map");
    // console.log("x: " + x + ", y:" + y);
    // 1440 800
    // coord: top-left:40.38, -80.12 bottom-right: 40.48, -79.83
    var lat = 40.48 - (0.1/(1+map.clientHeight))*(y-129);//+1 to avoid zero division
    var lon = -80.12 + (0.29/(1+map.clientWidth))*x;
    console.log("Latitude: " + lat + ", Longitude:" + lon);
    var dist = 2147483647;
    var index = 0;
    for (i = 0; i < latitude.length; i++) {
        var dX = latitude[i]-lat;
        var dY = longitude[i]-lon;
        var curr_dist = dX*dX + dY*dY;
        if (curr_dist < dist) {
            dist = curr_dist;
            index = i;
        }
    }
    var meanO3 = 25.8896573;
    var stdO3 = 12.2525487;
    var meanPM25 = 9.14702301;
    var stdPM25 = 5.67227436;

    // var degO3 = (O3[index] - (meanO3 - 2*stdO3))*180/(4*stdO3);
    // var degPM025 =  (PM025[index] - (meanPM25 - 2*stdPM25))*180/(4*stdPM25);
    // if (degO3 > 180) {
    //     degO3 = 180;
    // }
    // if (degO3 < 0) {
    //     degO3 = 0;
    // }
    // if (degPM025 > 180) {
    //     degPM025 = 180;
    // }
    // if (degPM025 < 0) {
    //     degPM025 = 0;
    // }
    var degO3;
    if (O3[index] >= 70) {
        degO3 = 180;
    } else if (O3[index] >= 50) {
        degO3 = 135 + (O3[index] - 50)*22.5/10;
    } else if (O3[index] >= 20) {
        degO3 = 45 + (O3[index] - 20)*90.0/30;
    } else if (O3[index] >= 0) {
        degO3 = O3[index]*45.0/20;
    } else {
        degO3 = 0;
    }
    var degPM025;
    if (PM025[index] >= 50) {
        degPM025 = 180;
    } else if (PM025[index] >= 25) {
        degPM025 = 157.5 + (PM025[index] - 25)*22.5/25;
    } else if (PM025[index] >= 15) {
        degPM025 = 135 + (PM025[index] - 15)*22.5/10;
    } else if (PM025[index] >= 10) {
        degPM025 = 90 + (PM025[index] - 10)*45.0/5;
    } else if (PM025[index] >= 6){
        degPM025 = 45 + (PM025[index] - 6)*45.0/4 - 2;
    } else if (PM025[index] >= 0) {
        degPM025 = PM025[index]*45/6.0 - 5;
        if (degPM025 < 0) degPM025 = 0;
    } else {
        degPM025 = 0;
    }

    $({deg: prev_degO3}).animate({deg: degO3}, {
        duration: 200,
        step: function(now) {
            $("#o3_arrow").css({
                transform: 'rotate(' + (now - 90) + 'deg)'
            });
        }
    });
    $({deg: prev_degPM025}).animate({deg: degPM025}, {
        duration: 200,
        step: function(now) {
            $("#pm25_arrow").css({
                transform: 'rotate(' + (now - 90) + 'deg)'
            });
        }
    });

    prev_degPM025 = degPM025;
    prev_degO3 = degO3;

    var map_area = document.getElementById("map_area");
    if (document.getElementById("marker") != null) {
        document.getElementById("marker").remove();
    }

    var newCursor = document.createElement("div");
    newCursor.className = "cursor2";
    newCursor.id = "marker";
    newCursor.style.left = (x-8).toString() + "px";
    newCursor.style.top = (y-8).toString() + "px";
    newCursor.onclick = searchPoint;
    var p = Math.round(PM025[index]);
    var o = Math.round(O3[index]);
    if (flag == 0) {
        newCursor.innerHTML = p;
    } else {
        newCursor.innerHTML = o;
    }
    
    map_area.appendChild(newCursor);
    numClicks++;
}

function detectMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location = "http://www.youtube.com";
    }
}

function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].startsWith("csrftoken=")) {
            return cookies[i].substring("csrftoken=".length, cookies[i].length);
        }
    }
    return "unknown";
}

function saveNumClicks() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState != 4) return;
        if (req.status != 200) return;
        var response = JSON.parse(req.responseText);
    }

    req.open("POST", "/pollution_map/recordNumClicks", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send("numClicks="+numClicks+"&category="+"No+Color+Dial"+"&csrfmiddlewaretoken="+getCSRFToken());

}

window.onbeforeunload= function() {
    saveNumClicks();
}

