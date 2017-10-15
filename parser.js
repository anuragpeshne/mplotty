const STATIC_PORT = 8080;
const SOCKET_PORT = 8081;
const REFRESH_DELAY  = 50;
const SPEED = 100;

commandq = [];
inpEof = false;

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
  var inp = d.toString();
  var lines = inp.split('\n');
  lines = lines.filter(function(line) { return line.length > 0;});
  for (var lineNo = 0; lineNo < lines.length; lineNo++) {
    var plottyRegex = /.*<plotty:(.*)>.*/g;
    var plottyCommand = plottyRegex.exec(lines[lineNo]);

    if (plottyCommand != null) {
      plottyCommand = plottyCommand[1]
      command = plottyCommand.split(",");
      command = command.map(function(e) {return e.trim()});
      commandq.push(command);
    } else {
      console.log(lines[lineNo]);
    }
  }
}).addListener("end", function() {
  inpEof = true;
});
// create static web server
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(STATIC_PORT, function(){
  console.log('Server running on ' + STATIC_PORT + '...');
});


// create Websocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: SOCKET_PORT });

wss.on('connection', function connection(ws) {
  console.log("connected");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  var real_time = (new Date).getTime();
  var last_log_time = 0;
  setInterval(function() {
    if (commandq.length > 0) {
      if (last_log_time == 0) last_log_time = parseInt(commandq[0][0]);
      var log_delay = parseInt(commandq[0][0]) - last_log_time;
      var real_delay = (new Date).getTime() - real_time;
      if (real_delay > (log_delay / SPEED)) {
        ws.send(JSON.stringify(commandq[0]));
        last_log_time = parseInt(commandq[0][0])
        commandq.splice(0, 1);
      }
      real_time = (new Date).getTime();
    } else if (inpEof) {
      process.exit();
    }
  }, REFRESH_DELAY);
});
