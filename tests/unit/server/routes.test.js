import { jest, expect, describe, test, beforeEach } from '@jest/globals';

import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

const { pages, location, constants } = config;

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

    test(`/controller - should return with ${pages.controllerHTML} file stream`, async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/controller';
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      jest.spyOn(
        Controller.prototype, 
        Controller.prototype.getFileStream.name
      ).mockResolvedValue({
        stream: mockFileStream
      });
      jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

      await handler(...params.values());

      expect(Controller.prototype.getFileStream)
        .toBeCalledWith(pages.controllerHTML);
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test('/index.html - should return with file stream', async () => {
      const filename = '/index.html';
      const expectedType = '.html';
      const expectedContentType = constants.CONTENT_TYPE[expectedType];
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = filename;
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockResolvedValue({
        stream: mockFileStream,
        type: expectedType
      });
      jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

      await handler(...params.values());

      expect(Controller.prototype.getFileStream).toBeCalledWith(filename);
      expect(params.response.writeHead).toHaveBeenCalledWith(
        200,
        {
          'Content-Type': expectedContentType
        }
      );
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test('/file.ext - should return with file stream', async () => {
      const filename = '/file.ext';
      const expectedType = '.ext';
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = filename;
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockResolvedValue({
        stream: mockFileStream,
        type: expectedType
      });
      jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

      await handler(...params.values());

      expect(Controller.prototype.getFileStream).toBeCalledWith(filename);
      expect(params.response.writeHead).not.toHaveBeenCalled();
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    test('/invalid - should return 404', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'POST';
      params.request.url = '/invalid';

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
  });

  describe('exceptions', () => {
    test('invalid file - should return 404', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/invalid.svg';
      jest.spyOn(
        Controller.prototype, 
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error: ENOENT'));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
    test('internal error - should return 500', async () => {
      const params = TestUtil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = 'index.html';
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error'));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
