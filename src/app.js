const { EventEmitter } = require('events');
const { Server } = require('ws');
const express = require('express');
const cors = require('cors');
const emitter = new EventEmitter();
let server = express();
const { Logger } = require('./logger');
const { exec } = require('child_process');
const fs = require('fs');

server.use(cors());
server.use(express.json());

const logger = new Logger();

server.use((req, res, next) => {
  logger.info('API', `${req.method} ${req.path}`);
  next();
});

let chip;
const devices = [];

server.post('/image', async (req, res, next) => {
  const { buffer } = req.body;
  const fileName = await savePicture(buffer);
  image2GCode(fileName);

  res.send({ msg: 'succeed' });
});

server.post('/pre-set', (req, res, next) => {
  const { shape } = req.body;
  console.log(shape);
  let index = 0;
  switch (shape) {
    case 'square':
      index = 0;
      break;
    case 'triangle':
      index = 2;
      break;
    case 'face':
      index = 3;
      break;
  }

  if (chip) {
    chip.send(index, { binary: false });
  }

  res.send({ msg: 'success' });
});

server = server.listen(process.env.PORT || 80, () =>
  logger.info('Server', `Server started on port ${process.env.PORT || 80}`),
);

const wss = new Server({ server });

emitter.on('sendGCode', () => {
  // TODO: Create the Logic to send the binary file to ESP

  if (chip) {
    chip.available = false;
  }
});

const savePicture = async (base64Image) => {
  const fileExtention = base64Image.split(';')[0].split('/')[1];
  const fileName = `image.${fileExtention}`;
  const base64Data = base64Image.split(',')[1];
  await fs.writeFile(`./${fileName}`, base64Data, 'base64', (err) => {
    if (err) {
    }
  });

  return fileName;
};

const image2GCode = (imageName) => {
  console.log(imageName);
  exec(
    `python image2GCode/image_to_gcode.py -i ${imageName} -o gcode.nc`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    },
  );
  exec(
    `python image2GCode/gcode_parser.py -i gcode.nc -b bin --use-g -s 200x200`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    },
  );
};

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
        data = await JSON.parse(data);

        if (data.type === 'text') {
          // TODO: Run the text to GCode As a child process
        } else if (data.type === 'picture') {
          // TODO: Save the picture to disk and run the picture to GCode As a child process
          const fileName = savePicture(data.buffer);
          image2GCode(fileName);
        } else if (data.type === 'pre-set') {
          // TODO: Send the Character Directly to ESP
          switch (data.buffer) {
            case 'triangle':
              drawTriangle();
              break;
            case 'square':
              drawSquare();
              break;
            case 'circle':
              drawCircle();
              break;
          }
        }

        emitter.emit('sendGCode');
      });
      break;
  }
});

wss.on('error', (error) => {
  logger.error('Server', error);
});
