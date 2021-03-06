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
    test('should return ok for effect command', async () => {
      const controller = new Controller();
      const command = 'effect';
      jest.spyOn(Service.prototype, Service.prototype.startStreaming.name)
        .mockResolvedValue();
      jest.spyOn(Service.prototype, Service.prototype.stopStreaming.name)
        .mockResolvedValue();
      jest.spyOn(Service.prototype, Service.prototype.readFxByName.name)
        .mockResolvedValue(command);
      jest.spyOn(Service.prototype, Service.prototype.appendFxStream.name)
        .mockReturnValue();

      expect(await controller.handleCommand({ command })).toStrictEqual({
        result: 'ok'
      });
      expect(Service.prototype.appendFxStream).toHaveBeenCalledWith(command);

    });
    test('should return command not found for invalid command', async () => {
      const controller = new Controller();
      const command = 'invalid';
      jest.spyOn(Service.prototype, Service.prototype.startStreaming.name)
        .mockResolvedValue();
      jest.spyOn(Service.prototype, Service.prototype.stopStreaming.name)
        .mockResolvedValue();
      jest.spyOn(Service.prototype, Service.prototype.readFxByName.name)
        .mockResolvedValue(undefined);

      expect(await controller.handleCommand({ command })).toStrictEqual({
        result: 'command not found'
      });
      expect(Service.prototype.startStreaming).not.toHaveBeenCalled();
      expect(Service.prototype.stopStreaming).not.toHaveBeenCalled();
    });
  });

  describe('createClientStream()', () => {
    test('should return stream and onClose function', () => {
      const controller = new Controller();
      const mockStream = TestUtil.generateReadableStream(['mock']);
      const id = '1';
      jest.spyOn(Service.prototype, Service.prototype.createClientStream.name)
        .mockReturnValue({ id, clientStream: mockStream });
      jest.spyOn(Service.prototype, Service.prototype.removeClientStream.name)
        .mockReturnValue();
      const { stream, onClose } = controller.createClientStream();

      expect(Service.prototype.createClientStream).toHaveBeenCalled();
      expect(stream).toStrictEqual(mockStream);

      onClose();
      expect(Service.prototype.removeClientStream).toHaveBeenCalledWith(id);
    });
  })
});
