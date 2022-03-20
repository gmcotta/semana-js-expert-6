import { logger } from './util.js';
import { Service } from "./service.js";

export class Controller {
  constructor() {
    this.service = new Service()
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }

  createClientStream() {
    const { id, clientStream } = this.service.createClientStream();
    const onClose = () => {
      logger.info(`closing connection of ${id}`);
      this.service.removeClientStream(id);
    }
    return {
      stream: clientStream,
      onClose
    }
  }

  async handleCommand({ command }) {
    logger.info(`Command received: ${command}`);
    const cmd = command.toLowerCase();
    const result = {
      result: 'ok'
    };
    if (cmd.includes('start')) {
      this.service.startStreaming();
      return result;
    }
    if (cmd.includes('stop')) {
      this.service.stopStreaming();
      return result;
    }

    const chosenFx = await this.service.readFxByName(cmd);
    if (!chosenFx) {
      return {
        result: 'command not found'
      };
    }
    logger.info(`Added effect to service: ${chosenFx}`);
    this.service.appendFxStream(chosenFx);
    return result;
  }
}