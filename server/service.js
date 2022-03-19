import fs from 'fs';
import fsPromises from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';
import streamsPromises from 'stream/promises';
import childProcess from 'child_process';
import { once } from 'events';
import Throttle from 'throttle';

import config from './config.js';
import { logger } from './util.js';

const {
  dir: {
    publicDirectory
  },
  constants: {
    fallbackBitRate,
    englishConversation,
    bitRateDivisor
  }
} = config;

export class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
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
      await Promise.all([
        once(stdout, 'readable'),
        once(stderr, 'readable')
      ]);
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

  broadcast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.clientStreams.delete(id);
            continue;
          }
          stream.write(chunk);
        }
        cb();
      }
    })
  }

  async startStreaming() {
    logger.info(`Starting with ${this.currentSong}`);
    const songOrignalBitRate = await this.getBitRate(this.currentSong);
    this.currentBitRate = songOrignalBitRate / bitRateDivisor;
    const calculatedBitRate = this.currentBitRate;
    const throttleTransform = this.throttleTransform = new Throttle(calculatedBitRate);
    const songReadable = this.currentReadable = this.createFileStream(this.currentSong);
    return streamsPromises.pipeline(
      songReadable,
      throttleTransform,
      this.broadcast()
    )
  }

  stopStreaming() {
    logger.info(`Ending with ${this.currentSong}`);
    this.throttleTransform?.end();
  }
};
