import winston from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

// Ensure logs directory exists
const logDir = path.resolve(__dirname, '../../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// The logger file name, used to skip frames from this file in stack trace
const loggerFileName = path.basename(__filename);

/**
 * Extract caller filename and line number from stack trace.
 * Skips all frames inside this Logger.ts file.
 */
function getCallerInfo(): string {
  const err = new Error();
  const stack = err.stack?.split('\n') || [];

  // Stack trace lines example:
  // at FunctionName (path/to/file.ts:line:column)
  // Skip first 2 lines ("Error" + this function)
  for (let i = 2; i < stack.length; i++) {
    const line = stack[i];
    if (!line.includes(loggerFileName)) {
      // Extract path and line number using regex
      const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at (.*):(\d+):(\d+)/);
      if (match && match.length >= 4) {
        const filePath = match[1];
        const lineNumber = match[2];
        const fileName = path.basename(filePath);
        return `${fileName}:${lineNumber}`;
      }
    }
  }
  return 'unknown';
}

// Basic format: timestamp, level and message
const baseFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

// Create the main Winston logger instance
const loggerInstance = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    baseFormat
  ),
  transports: [
    new winston.transports.Console(),

    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      auditFile: 'rotating-file-audit'
    }),
  ],
});

// Wrap logger methods to prepend caller info
const methods = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] as const;

const logger: Record<typeof methods[number], (...args: any[]) => void> = {} as any;

methods.forEach(method => {
  logger[method] = (...args: any[]) => {
    const callerInfo = getCallerInfo();
    if (args.length > 0 && typeof args[0] === 'string') {
      args[0] = `[${callerInfo}] ${args[0]}`;
    } else {
      args.unshift(`[${callerInfo}]`);
    }
    (loggerInstance as any)[method](...args);
  };
});

export { logger };
