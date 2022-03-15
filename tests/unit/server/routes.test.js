import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
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
    test.todo(`/home - should return with ${config.pages.homeHTML} file stream`);
    test.todo(`/controller - should return with ${config.pages.controllerHTML} file stream`);
    test.todo('/file.ext - should return with file stream');
    test.todo('invalid route - should return 404');
  });

  describe('exceptions', () => {
    test.todo('invalid file - should return 404');
    test.todo('internal error - should return 500');
  });
});
