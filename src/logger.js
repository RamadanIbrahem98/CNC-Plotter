const colors = require('colors');

colors.setTheme({
  INPUT: 'grey',
  INFO: 'green',
  WARNING: 'yellow',
  DEBUG: 'blue',
  ERROR: 'red',
});

class Logger {
  LEVELS = {
    NOTSET: 0,
    INPUT: 10,
    INFO: 20,
    DEBUG: 30,
    WARNING: 40,
    ERROR: 50,
  };

  constructor() {
    this.setLevel(this.LEVELS.NOTSET);
  }

  setLevel(level) {
    this.level = level;
  }

  logTime() {
    const now = new Date();
    const time = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return time;
  }

  debug(type, message) {
    if (this.level <= this.LEVELS.DEBUG) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['DEBUG']);
    }
  }

  info(type, message) {
    if (this.level <= this.LEVELS.INFO) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['INFO']);
    }
  }

  input(type, message) {
    if (this.level <= this.LEVELS.INPUT) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['INPUT']);
    }
  }

  debug(type, message) {
    if (this.level <= this.LEVELS.DEBUG) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['DEBUG']);
    }
  }

  warning(type, message) {
    if (this.level <= this.LEVELS.WARNING) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['WARNING']);
    }
  }

  error(type, message) {
    if (this.level <= this.LEVELS.ERROR) {
      console.log(`[${this.logTime()}] - [${type}]: ${message}`['ERROR']);
    }
  }
}

module.exports = {
  Logger,
};
