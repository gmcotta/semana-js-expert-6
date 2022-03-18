import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import TestUtil from '../_util/testUtil';

import { Service } from '../../../server/service';
import { Controller } from '../../../server/controller';

describe('#Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('getFileStream()', () => {
    test('should return file stream', async () => {
      const controller = new Controller();
      const mockStream = TestUtil.generateReadableStream(['mock']);
      const mockFileName = 'filename.html';
      const mockType = '.html';
      jest.spyOn(Service.prototype, Service.prototype.getFileStream.name)
        .mockResolvedValue({
          stream: mockStream,
          type: mockType
        });
        
      expect(await controller.getFileStream(mockFileName)).toStrictEqual({
        stream: mockStream,
        type: mockType
      });
    });
  });

  describe('handleCommand()', () => {
    test('should return ok for start command', async () => {
      const controller = new Controller();
      const command = 'start';
      
      jest.spyOn(Service.prototype, Service.prototype.startStreaming.name)
        .mockResolvedValue();

      expect(await controller.handleCommand({ command })).toStrictEqual({
        result: 'ok'
      });
      expect(Service.prototype.startStreaming).toHaveBeenCalled();
    });
    test('should return ok for stop command', async () => {
      const controller = new Controller();
      const command = 'stop';
      
      jest.spyOn(Service.prototype, Service.prototype.stopStreaming.name)
        .mockResolvedValue();

      expect(await controller.handleCommand({ command })).toStrictEqual({
        result: 'ok'
      });
      expect(Service.prototype.stopStreaming).toHaveBeenCalled();
    });
    test('should return command not found for invalid command', async () => {
      const controller = new Controller();
      const command = 'invalid';
      jest.spyOn(Service.prototype, Service.prototype.startStreaming.name)
        .mockResolvedValue();
      jest.spyOn(Service.prototype, Service.prototype.stopStreaming.name)
        .mockResolvedValue();

      expect(await controller.handleCommand({ command })).toStrictEqual({
        result: 'command not found'
      });
      expect(Service.prototype.startStreaming).not.toHaveBeenCalled();
      expect(Service.prototype.stopStreaming).not.toHaveBeenCalled();
    });
  });
});
