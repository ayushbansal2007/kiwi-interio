const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file"); // 👈 Plugin import kiya

// Rozana nayi file banane ka tareeka (Transport)
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,    // Purani files ko zip (.gz) kar do taaki space bache
  maxSize: "20m",         // Agar ek din me file 20MB ki ho jaye toh dusri file bana do
  maxFiles: "2d"         // 2 din baad purane logs automatic saaf (delete)
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    dailyRotateFileTransport // 🔥 Ab ye bina storage phade zindagi bhar chalega
  ],
});

module.exports = logger;