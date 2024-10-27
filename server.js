const http = require('http');
const { Command } = require('commander');
const fs = require('fs');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cachePath>', 'Cache directory path');

const args = process.argv.slice(2);

if (!args.includes('-h') && !args.includes('--host') ||
    !args.includes('-p') && !args.includes('--port') ||
    !args.includes('-c') && !args.includes('--cache')) {
  console.log('Параметр не задано!');
  process.exit(1);
}

program.parse(process.argv);

const { host, port, cache } = program.opts();


if (isNaN(port) || port <= 0 || port > 65535) {
  console.log('Помилка: Порт має бути числом в діапазоні від 1 до 65535!');
  process.exit(1);
}


if (!fs.existsSync(cache)) {
  console.log('Помилка: Кеш-каталог не існує!');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('sofushka`s server \n');
});

server.listen(port, host, () => {
  console.log(`Сервер запущено  http://${host}:${port}`);
});
