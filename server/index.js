import server from './server.js';
import { logger } from './util.js';
import config from './config.js';

server()
  .listen(config.port)
  .on('listening', () => logger.info(`server running at port ${config.port}`));

process.on(
  'uncaughtException', 
  error => logger.error(`UncaughtException happened: ${error.stack || error}`)
);

process.on(
  'unhandledRejection', 
  error => logger.error(`UnhandledRejection happened: ${error.stack || error}`)
);