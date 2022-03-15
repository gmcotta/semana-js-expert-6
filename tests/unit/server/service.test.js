import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import { Service } from '../../../server/service.js';
import config from '../../../server/config.js';

const {
  dir: {
    publicDirectory
  }
} = config;

describe('#Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('createFileStream()', () => {
    test('should create file stream', () => {
      const service = new Service();
      jest.spyOn(fs, fs.createReadStream.name).mockReturnValue('mock');
      expect(service.createFileStream('filename')).toBe('mock');
    });
  });

  describe('getFileInfo()', () => {
    test('should get file info', async () => {
      const service = new Service();
      const file = 'file.ext';
      const expectedName = path.join(publicDirectory, file);
      const expectedType = '.ext';
      jest.spyOn(fsPromises, 'access').mockResolvedValue();

      expect(await service.getFileInfo(file)).toStrictEqual({
        type: expectedType,
        name: expectedName
      });
    });
  });

  describe('getFileStream()', () => {
    test('should get file stream', async () => {
      const service = new Service();
      const file = 'file.ext';
      jest.spyOn(Service.prototype, 'getFileInfo').mockResolvedValue({
        type: 'mocked type',
        name: 'mocked name'
      });
      jest.spyOn(Service.prototype, 'createFileStream')
        .mockReturnValue('mock stream');
      expect(await service.getFileStream(file)).toStrictEqual({
        stream: 'mock stream',
        type: 'mocked type'
      });
    });
  });
});
