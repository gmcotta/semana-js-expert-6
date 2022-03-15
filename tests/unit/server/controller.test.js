import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';

import { Controller } from '../../../server/controller';
import { Service } from '../../../server/service';

describe('#Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('getFileStream()', () => {
    test('should return value', async () => {
      const controller = new Controller();

      jest.spyOn(Service.prototype, 'getFileStream').mockResolvedValue('mock');
      expect(await controller.getFileStream('filename')).toBe('mock');
    });
  });
});
