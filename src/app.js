const { EventEmitter } = require('events');
const { Server } = require('ws');
const express = require('express');
const cors = require('cors');
const emitter = new EventEmitter();
let server = express();
const { Logger } = require('./logger');

server.use(cors());
server.use(express.json());

const logger = new Logger();

server.use((req, res, next) => {
  logger.info('API', `${req.method} ${req.path}`);
  next();
});

server = server.listen(process.env.PORT || 80, () =>
  logger.info('Server', `Server started on port ${process.env.PORT || 80}`),
);

const wss = new Server({ server });

let chip;
const devices = [];

emitter.on('sendGCode', () => {
  // TODO: Create the Logic to send the binary file to ESP

  if (chip) {
    chip.available = false;
  }
});

wss.on('connection', function connection(ws, req) {
  switch (req.url) {
    case '/master':
      chip = ws;
      ws.available = true;
      let data;
      logger.info('Master', 'Master Connected');
      ws.on('message', async (message) => {
        logger.input('Master', message);
        try {
          data = await JSON.parse(message);
        } catch (error) {
          logger.error('Master Data', 'Parsing JSON Data');
        }
      });
      chip.on('close', () => {
        logger.warning('Master', 'Master Closed');
      });
      break;
    case '/slave':
      logger.info('Slave', 'Slave Connected');
      devices.push(ws);
      ws.on('message', async (data) => {
        if (chip && !chip.available) {
          ws.send({ msg: 'ESP is busy' }, { binary: false });
          return;
        }
        logger.input('Slave', data);
        data = await JSON.parse(data);

        if (data.type === 'text') {
          // TODO: Run the text to GCode As a child process
        } else if (data.type === 'picture') {
          // TODO: Save the picture to disk and run the picture to GCode As a child process
        } else if (data.type === 'pre-set') {
          // TODO: Send the Character Directly to ESP
        }

        emitter.emit('sendGCode');
      });
      break;
  }
});

wss.on('error', (error) => {
  logger.error('Server', error);
});
