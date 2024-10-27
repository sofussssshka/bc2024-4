const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const http = require("http");
const superagent = require("superagent");

program
  .option("-h, --host <server address>", "server address")
  .option("-p, --port <server port>", "server port number")
  .option("-c, --cache <path>", "path to the directory with cached files");

program.parse(process.argv);
const options = program.opts();
const host = options.host;
const port = options.port;
const cache = options.cache;

if (!host) {
  console.error("Впишіть хост!");
  process.exit(1);
}
if (!port) {
  console.error("Впишіть порт!");
  process.exit(1);
}
if (!cache) {
  console.error("Вкажіть шлях до папки в якій буде зберігатися кеш");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = req.url;
  const filePath = path.join(cache, `${url}.jpeg`);

  if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache);
  }

  if (req.method === "GET") {
    if (url === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (fs.existsSync(filePath)) {
      fs.promises.readFile(filePath).then((data) => {
        res.setHeader("Content-Type", "image/jpeg");
        res.writeHead(200);
        res.end(data);
      });
    } else {
      superagent
        .get(`https://http.cat${url}`)
        .then((response) => {
          const data = response.body;

          fs.promises.writeFile(filePath, data).then(() => {
            res.setHeader("Content-Type", "image/jpeg");
            res.writeHead(200);
            res.end(data);
            return;
          });
        })
        .catch((err) => {
          res.writeHead(404);
          res.end("Status Not Found");
        });
    }
  } else if (req.method === "PUT") {
    let body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const buffer = Buffer.concat(body);
      fs.writeFile(filePath, buffer, (err) => {
        if (!err) {
          res.writeHead(201);
          res.end("File created successfully");
          return;
        }
        res.writeHead(500);
        res.end("Server error");
      });
    });
  } else if (req.method === "DELETE") {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          res.writeHead(200);
          res.end("File deleted successfully");
          return;
        }
        res.writeHead(500);
        res.end("Server error");
        return;
      });
    } else {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(404);
      res.end("404 Not found");
      return;
    }
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
});

server.listen(port, host, () => {
  console.log(`Сервер запущений на http://${host}:${port}`);
});
