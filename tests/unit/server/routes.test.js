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
    describe('/', () => {
      test('should redirect to home page', async () => {
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
    });
    
    describe('/home', () => {
      test(`should return with ${pages.homeHTML} file stream`, async () => {
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
    });

    describe('/controller', () => {
      test(`should return with ${pages.controllerHTML} file stream`, async () => {
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
    });

    describe('/index.html', () => {
      test('should return with file stream', async () => {
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
    });

    describe('/file.ext', () => {
      test('should return with file stream', async () => {
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
    });

    describe('/stream?id=1', () => {
      test('should create client stream', async () => {
        const params = TestUtil.defaultHandleParams();
        params.request.method = 'GET';
        params.request.url = '/stream';
        const stream = TestUtil.generateReadableStream(['mock']);
        const onClose = jest.fn();
        jest.spyOn(
          Controller.prototype, 
          Controller.prototype.createClientStream.name
        ).mockReturnValue({ stream, onClose });
        jest.spyOn(stream, 'pipe').mockReturnValue();

        await handler(...params.values());
        params.request.emit('close');
        
        expect(params.response.writeHead).toHaveBeenCalledWith(
          200, 
          {
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes'
          }
        );
        expect(Controller.prototype.createClientStream).toHaveBeenCalled();
        expect(stream.pipe).toHaveBeenCalledWith(params.response);
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('POST', () => {
    describe('/invalid', () => {
      test('should return 404', async () => {
        const params = TestUtil.defaultHandleParams();
        params.request.method = 'POST';
        params.request.url = '/invalid';
  
        await handler(...params.values());
  
        expect(params.response.writeHead).toHaveBeenCalledWith(404);
        expect(params.response.end).toHaveBeenCalled();
      });
    });
    describe('/controller', () => {
      test('should handle command', async () => {
        const params = TestUtil.defaultHandleParams();
        const body = { command: 'start' };
        const responseBody = { result: 'ok' };
        
        params.request.method = 'POST';
        params.request.url = '/controller';
        params.request.push(JSON.stringify(body));
        
        jest.spyOn(
          Controller.prototype, 
          Controller.prototype.handleCommand.name
        ).mockResolvedValue(responseBody);

        await handler(...params.values());
        expect(Controller.prototype.handleCommand).toHaveBeenCalledWith(body);
        expect(params.response.end)
          .toHaveBeenCalledWith(JSON.stringify(responseBody));
      });
    });
  });

  describe('exceptions', () => {
    describe('invalid file', () => {
      test('should return 404', async () => {
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
    });
    
    describe('internal error', () => {
      test('should return 500', async () => {
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
});
