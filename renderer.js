const SOCKET_PORT = 8081
const CHART_FREQ = 2000
window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://127.0.0.1:' + SOCKET_PORT);

connection.onopen = function () {
    // connection is opened and ready to use
    console.log("connected");
    document.getElementById("status-bar").innerHTML = "Connected";
};

connection.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log("Error in connection:\n" + error);
    document.getElementById("status-bar").innerHTML = "Error in connection";
};

connection.onmessage = function (message) {
    command = JSON.parse(message.data);
    console.log(command);
    switch (command[1]) {
    case "send":
        var sender_id = command[2];
        var receiver_id = command[3];
        var state = parseInt(command[4]);

        if (state == 0) {
            $('#' + sender_id).removeClass("active");
        }
        if ($('#' + sender_id).hasClass("overloaded")) {
            $('#' + sender_id).removeClass("overloaded");
            $('#' + sender_id).addClass("active");
        }
        $('#' + sender_id).data('state', state);
        $('#' + sender_id).attr('title', state);
        break;

    case "receive":
        var receiver_id = command[2];
        var state = parseInt(command[3]);
        if (state >= 100) {
            $('#' + receiver_id).removeClass("active");
            $('#' + receiver_id).addClass("overloaded");
        } else if (state > 0 && $('#' + receiver_id).hasClass("active") == false) {
            $('#' + receiver_id).addClass("active");
        }
        $('#' + receiver_id).data('state', state);
        $('#' + receiver_id).attr('title', state);
        break;

    default:
        console.log("unknown command:\n" + command[1] + " at " + command);
    }
};

$(document).ready(function() {
    function getChart(usage) {
        var graph = "[";
        for (var i = 0; i < Math.floor(usage / 10); i++) {
            graph += "#";
        }
        for (var i = 0; i < 10 - Math.floor(usage / 10); i++) {
            graph += "&nbsp;";
        }
        return graph + "]";
    }

    function to2(i) {
        if (i < 10) return "0" + i; else return "" + i;
    }

    function to3(i) {
        if (i < 100) return "0" + to2(i); else return to2(i);
    }

    var cell_count = $(".cell").length;
    function updateChart() {
        $('#chartContainer').html("");
        for (var i = 0; i < cell_count; i++) {
            var usage = $('#' + i).data("state") || 0;
            $("<div></div>").html(to2(i) + ":" + to3(usage) + "% " + getChart(usage)).appendTo("#chartContainer");
        }
    }
    window.setInterval(updateChart, CHART_FREQ);
});
