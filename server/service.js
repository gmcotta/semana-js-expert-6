import fs from 'fs';
import fsPromises from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PassThrough } from 'stream';
import childProcess from 'child_process';
// import throttle from 'throttle';

import config from './config.js';
import { logger } from './util.js';

const {
  dir: {
    publicDirectory
  },
  constants: {
    fallbackBitRate
  }
} = config;

export class Service {
  constructor() {
    this.clientStreams = new Map();
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args);
  }

  createClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();
    this.clientStreams.set(id, clientStream);
    return {
      id,
      clientStream
    };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file);
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);
    return {
      type: fileType,
      name: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { type, name } = await this.getFileInfo(file);
    return {
      stream: this.createFileStream(name),
      type
    };
  }

  async getBitRate(song) {
    try {
      const args = ['--i', '-B', song];
      const { stderr, stdout, stdin } = this._executeSoxCommand(args);
      const [success, error] = [stdout, stderr].map(stream => stream.read());
      if (error) {
        return await Promise.reject(error);
      }
      return success.toString().trim().replace(/k/, '000');
    } catch (error) {
      logger.error(`Bit rate error: ${error}`);
      return fallbackBitRate;
    }
  }
};
