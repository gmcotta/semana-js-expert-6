import { Transform } from 'stream';
import { setTimeout } from 'timers/promises';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import supertest from 'supertest';
import portfinder from 'portfinder';

import Server from '../../../server/server.js';

const getAvailablePort = portfinder.getPortPromise;
const RETENTION_DATA_PERIOD = 200;
const DEFAULT_COMMAND_RESPONSE = JSON.stringify({
  result: 'ok'
});
const POSSIBLE_COMMANDS = {
  start: 'start',
  stop: 'stop',
  invalid: 'invalid'
};

describe('API E2E Suite test', () => {
  function pipeAndReadStreamData(stream, onChunk) {
    const transform = new Transform({
      transform(chunk, enc, cb) {
        onChunk(chunk);
        cb(null, chunk);
      }
    });
    return stream.pipe(transform);
  }
  describe('client workflow', () => { 
    async function getTestServer() {
      const getSuperTest = port => supertest(`http://localhost:${port}`);
      const port  = await getAvailablePort();
      return new Promise((resolve, reject) => {
        const server = Server.listen(port)
          .once('listening', () => {
            const testServer = getSuperTest(port);
            const response = {
              testServer,
              kill() {
                server.close();
              }
            }
            return resolve(response);
          })
          .once('error', reject);
      })
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer.post('/controller')
            .send({
              command
            });
          expect(response.text).toStrictEqual(DEFAULT_COMMAND_RESPONSE);
        }
      }
    }

    test('should not receive data stream if the process is not playing', async () => {
      const server = await getTestServer();
      const stream = server.testServer.get('/stream');
      const onChunk = jest.fn();
      pipeAndReadStreamData(stream, onChunk);
      await setTimeout(RETENTION_DATA_PERIOD);
      server.kill();
      expect(onChunk).not.toHaveBeenCalled();
    });
    test('should receive data stream if the process is playing', async () => {
      const server = await getTestServer();
      const stream = server.testServer.get('/stream');
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);
      pipeAndReadStreamData(stream, onChunk);
      await send(POSSIBLE_COMMANDS.start);
      await setTimeout(RETENTION_DATA_PERIOD);
      await send(POSSIBLE_COMMANDS.stop);
      const [buffer] = onChunk.mock.calls[0];
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      server.kill();
    });
  });
});
