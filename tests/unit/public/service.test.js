import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import { JSDOM } from "jsdom";

import Service from "../../../public/controller/js/service";


describe('#Service - test suite for Service class', () => {
  const deps = {
    url: 'localhost:3000'
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('makeRequest()', () => {
    test('should return json result', async () => {
      const data = { ok: 'true' };
      const service = new Service(deps);
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn()
      });

      await service.makeRequest(data);

      expect(global.fetch).toHaveBeenCalledWith(
        deps.url,
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      );
    });
  });
});
