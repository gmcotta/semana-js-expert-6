import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import childProcess from 'child_process';
import { PassThrough, Writable } from 'stream';
import streamPromises from 'stream/promises';
import Throttle from 'throttle';

import { Service } from '../../../server/service.js';
import config from '../../../server/config.js';
import TestUtil from '../_util/testUtil.js';

const {
  dir: {
    publicDirectory,
    fxDirectory
  },
  constants: {
    fallbackBitRate,
    bitRateDivisor
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

  describe('_executeSoxCommand()', () => {
    test('should call childProcess', () => {
      const service = new Service();
      const args = ['arg1'];
      jest.spyOn(childProcess, childProcess.spawn.name).mockReturnValue();
      service._executeSoxCommand(args);
      expect(childProcess.spawn).toHaveBeenCalledWith('sox', args);
    });
  });

  describe('createClientStream()', () => {
    test('should create client stream', () => {
      const service = new Service();
      jest.spyOn(service.clientStreams, service.clientStreams.set.name)
        .mockReturnValue();
      const { id, clientStream } = service.createClientStream();

      expect(clientStream).toBeInstanceOf(PassThrough);
      expect(service.clientStreams.set)
        .toHaveBeenCalledWith(id, clientStream);
    });
  });
  
  describe('removeClientStream()', () => {
    test('should remove client stream', () => {
      const service = new Service();
      jest.spyOn(service.clientStreams, service.clientStreams.delete.name)
        .mockReturnValue();
      service.removeClientStream();

      expect(service.clientStreams.delete).toHaveBeenCalled();
    });
  });

  describe('getBitRate()', () => {
    test('should return bit rate with zeros', async () => {
      const service = new Service();
      const mockSong = 'song.mp3';
      jest.spyOn(service, service._executeSoxCommand.name).mockReturnValue({
        stdout: TestUtil.generateReadableStream([' 128k ']),
        stderr: TestUtil.generateReadableStream(['']),
        stdin: TestUtil.generateWritableStream(() => {})
      });
      const returnedBitRate = await service.getBitRate(mockSong);

      expect(service._executeSoxCommand)
        .toHaveBeenCalledWith(['--i', '-B', mockSong]);
      expect(returnedBitRate).toBe('128000');
    });

    test('should return default bit rate', async () => {
      const service = new Service();
      const mockSong = 'song.mp3';
      jest.spyOn(service, service._executeSoxCommand.name).mockReturnValue({
        stdout: TestUtil.generateReadableStream(['']),
        stderr: TestUtil.generateReadableStream(['error']),
        stdin: TestUtil.generateWritableStream(() => {})
      });
      const returnedBitRate = await service.getBitRate(mockSong);

      expect(service._executeSoxCommand)
        .toHaveBeenCalledWith(['--i', '-B', mockSong]);
      expect(returnedBitRate).toBe(fallbackBitRate);
    });
  });

  describe('broadcast()', () => {
    test('should write chunk and end client stream', () => {
      const service = new Service();

      jest.spyOn(service.clientStreams, service.clientStreams.delete.name)
        .mockReturnValue();
      const mockClientStream1 = TestUtil.generateWritableStream(() => {});
      const mockClientStream2 = TestUtil.generateWritableStream(() => {});
      service.clientStreams.set('1', mockClientStream1);
      service.clientStreams.set('2', mockClientStream2);
      const writable = service.broadcast();
      mockClientStream1.end();
      writable.write('mock');

      expect(writable).toBeInstanceOf(Writable);
      expect(service.clientStreams.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('startStreaming()', () => {
    test('should start streaming', async () => {
      const service = new Service();
      const currentSong = 'song.mp3';
      const bitRate = '128000';
      const songReadable = TestUtil.generateReadableStream(['mock']);
      service.currentSong = currentSong;
      jest.spyOn(service, service.getBitRate.name).mockResolvedValue(bitRate);
      jest.spyOn(service, service.createFileStream.name)
        .mockReturnValue(songReadable);
      jest.spyOn(streamPromises, streamPromises.pipeline.name)
        .mockResolvedValue('mock pipeline');
      jest.spyOn(service, service.broadcast.name)
        .mockReturnValue(TestUtil.generateWritableStream(() => {}));
      const expectedCurrentBitRate = bitRate / bitRateDivisor;

      const result = await service.startStreaming();

      expect(service.currentBitRate).toBe(expectedCurrentBitRate);
      expect(result).toStrictEqual('mock pipeline');
      expect(service.createFileStream).toHaveBeenCalledWith(currentSong);
      expect(streamPromises.pipeline).toHaveBeenCalledWith(
        songReadable,
        service.throttleTransform,
        service.broadcast()
      );
    });
  });

  describe('stopStreaming()', () => {
    test('should stop streaming with throttleTransform', () => {
      const service = new Service();
      service.throttleTransform = new Throttle(64000);
      jest.spyOn(service.throttleTransform, 'end')
        .mockReturnValue();
      service.stopStreaming();
      expect(service.throttleTransform.end).toHaveBeenCalled();
    });
  });

  describe('readFxByName()', () => {
    test('should return song path', async () => {
      const service = new Service();
      const fxName = 'fx1';
      const fxSongOnDisk = 'fx1.mp3';
      const expectedPath = `${fxDirectory}/${fxSongOnDisk}`;
      jest.spyOn(fsPromises, fsPromises.readdir.name)
        .mockResolvedValue([fxSongOnDisk]);
      const returnedPath = await service.readFxByName(fxName);
      expect(returnedPath).toStrictEqual(expectedPath);
      expect(fsPromises.readdir).toHaveBeenCalledWith(fxDirectory);
    });
    test('should reject if song was not found', () => {
      const service = new Service();
      const fxName = 'fx1';
      jest.spyOn(fsPromises, fsPromises.readdir.name)
        .mockResolvedValue([]);
      expect(service.readFxByName(fxName))
        .rejects
        .toEqual(`The effect ${fxName} was not found.`)
    });
  });

  describe('mergeAudioStreams()', () => {
    test('should return stream with merged audios', () => {
      const service = new Service();
      const song = 'fx1.mp3';
      const readable = TestUtil.generateReadableStream(['fx']);
      jest.spyOn(service, service._executeSoxCommand.name).mockReturnValue({
        stdin: TestUtil.generateWritableStream('fx'),
        stdout: TestUtil.generateReadableStream(['128k']),
        stderr: TestUtil.generateReadableStream(['']),
      });
      jest.spyOn(streamPromises, streamPromises.pipeline.name)
        .mockResolvedValue();
      const result = service.mergeAudioStreams(song, readable);
      expect(result).toBeInstanceOf(PassThrough);
    });
  });

  describe('appendFxStream()', () => {
    test('should append new stream', async () => {
      const currentFx = 'fx.mp3';
      const service = new Service();
      service.throttleTransform = new PassThrough();
      service.currentReadable = TestUtil.generateReadableStream(['abc']);

      const mergedthrottleTransformMock = new PassThrough();
      const expectedFirstCallResult = 'ok1';
      const expectedSecondCallResult = 'ok2';
      const writableBroadcaster = TestUtil.generateWritableStream(() => {});

      jest.spyOn(
          streamPromises,
          streamPromises.pipeline.name
      )
        .mockResolvedValueOnce(expectedFirstCallResult)
        .mockResolvedValueOnce(expectedSecondCallResult);
      jest.spyOn(
        service,
        service.broadcast.name
      ).mockReturnValue(writableBroadcaster);
      jest.spyOn(
        service,
        service.mergeAudioStreams.name
      ).mockReturnValue(mergedthrottleTransformMock);
      jest.spyOn(
        mergedthrottleTransformMock,
        "removeListener"
      ).mockReturnValue();
      jest.spyOn(
        service.throttleTransform,
        "pause"
      );
      jest.spyOn(
        service.currentReadable,
        "unpipe"
      ).mockImplementation();

      service.appendFxStream(currentFx);
      expect(service.throttleTransform.pause).toHaveBeenCalled();
      expect(service.currentReadable.unpipe)
        .toHaveBeenCalledWith(service.throttleTransform);

      service.throttleTransform.emit('unpipe');
      const [call1, call2] = streamPromises.pipeline.mock.calls;
      const [resultCall1, resultCall2] = streamPromises.pipeline.mock.results;
      const [throttleTransformCall1, broadCastCall1] = call1;
      expect(throttleTransformCall1).toBeInstanceOf(Throttle);
      expect(broadCastCall1).toStrictEqual(writableBroadcaster);

      const [result1, result2] = await Promise.all([
        resultCall1.value, 
        resultCall2.value
      ]);
      expect(result1).toStrictEqual(expectedFirstCallResult);
      expect(result2).toStrictEqual(expectedSecondCallResult);

      const [mergedStreamCall2, throttleTransformCall2] = call2;
      expect(mergedStreamCall2).toStrictEqual(mergedthrottleTransformMock);
      expect(throttleTransformCall2).toBeInstanceOf(Throttle);
      expect(service.currentReadable.removeListener).toHaveBeenCalled();
    });
  });
});
