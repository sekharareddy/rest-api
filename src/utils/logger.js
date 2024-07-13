const winston = require("winston");
const path = require("path");

const { format, transports } = winston;
const { combine, timestamp, label, printf, splat, simple, colorize } = format;

const myFormat = printf((info) => {
  const pid = info.pid || process.pid;
  return `${info.timestamp} : [${info.label}] : ${pid} : ${info.level} : ${info.message}`;
});

let initialized = false;

const logger = function (callingModule) {
  if (initialized) {
    return winston;
  }

  // eslint-disable-next-line no-use-before-define
  const logModule = getLabel(callingModule);
  const logLevel = "info";

  const transportList = [
    new transports.Console({
      format: combine(
        colorize(),
        splat(),
        simple(),
        label({ label: logModule }),
        timestamp(),
        myFormat,
      ),
      level: logLevel,
    }),
  ];

  winston.configure({
    level: logLevel,
    transports: transportList,
  });

  initialized = true;
  return winston;
};

const getLabel = function (callingModule) {
  const parts = callingModule.filename.split(path.sep);
  return `${parts[parts.length - 2]}/${parts.pop()}`;
};

module.exports = logger;
