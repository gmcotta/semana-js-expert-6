import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

const { pages, location } = config;

describe('#Routes - test suite for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    test('/ - should redirect to home page', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/';

      await handler(...params.values());
      
      expect(params.response.writeHead).toHaveBeenCalledWith(
        302, 
        {
          'Location': location.home
        }
      );
      expect(params.response.end).toHaveBeenCalled();
    });
    test(`/home - should return with ${pages.homeHTML} file stream`, async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/home';
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      jest.spyOn(
        Controller.prototype, 
        Controller.prototype.getFileStream.name
      ).mockResolvedValue({
        stream: mockFileStream
      });
      jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

      await handler(...params.values());

      expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });
    test.todo(`/controller - should return with ${pages.controllerHTML} file stream`);
    test.todo('/file.ext - should return with file stream');
    test.todo('invalid route - should return 404');
  });

  describe('exceptions', () => {
    test.todo('invalid file - should return 404');
    test.todo('internal error - should return 500');
  });
});
