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
});
