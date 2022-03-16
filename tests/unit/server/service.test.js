import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import { Service } from '../../../server/service.js';
import config from '../../../server/config.js';
import TestUtil from '../_util/testUtil.js';

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
      const mockReadSteam = TestUtil.generateReadableStream(['mock']);
      const mockFileName = 'filename.html';
      jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(mockReadSteam);

      expect(service.createFileStream(mockFileName))
        .toStrictEqual(mockReadSteam);
      expect(fs.createReadStream).toHaveBeenCalledWith(mockFileName);
    });
  });

  describe('getFileInfo()', () => {
    test('should get file info', async () => {
      const service = new Service();
      const file = 'file.ext';
      const expectedName = path.join(publicDirectory, file);
      const expectedType = '.ext';
      jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue();

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
      const expectedName = path.join(publicDirectory, file);
      const expectedType = '.ext';
      const mockStream = TestUtil.generateReadableStream(['mock']);
      jest.spyOn(service, service.getFileInfo.name).mockResolvedValue({
        type: expectedType,
        name: expectedName
      });
      jest.spyOn(service, service.createFileStream.name)
        .mockReturnValue(mockStream);

      expect(await service.getFileStream(file)).toStrictEqual({
        stream: mockStream,
        type: expectedType
      });
      expect(service.getFileInfo).toHaveBeenCalledWith(file);
      expect(service.createFileStream).toHaveBeenCalledWith(expectedName);
    });
  });
});
