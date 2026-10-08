const http = require("node:http");
const server = http.createServer(function (req, res) {
  if (req.url === "/getScreteData") {
    res.end("There is no secret data");
  }
  res.end("hello world");
});
server.listen(9999);
