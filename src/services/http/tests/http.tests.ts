import { HttpService } from '../http';

describe('HttpService', () => {
  const request = jest.fn();
  let service: HttpService;
  const options = {
    hostname: 'some.host',
    path: '/path/to/resource',
    method: 'GET' as const,
  };

  beforeEach(() => {
    service = new HttpService({ request });
  });
  afterEach(() => request.mockClear());

  it('parse the http response as success when status code is 2xx', () => {
    const response = { statusCode: 200, body: '123' };
    const result = service.parseHttpResponse(response);
    expect(result).toEqual({
      kind: 'success',
      statusCode: 200,
      body: '123',
    });
  });

  it('parse the http response as fail when status code is 3xx', () => {
    const response = { statusCode: 300, body: '123' };
    const result = service.parseHttpResponse(response);
    expect(result).toEqual({
      kind: 'failed',
      statusCode: 300,
      body: '123',
    });
  });

  it('throws when status code is none', () => {
    const response = { statusCode: 'none' as const, body: '123' };
    expect(() => service.parseHttpResponse(response)).toThrow();
  });

  it('sends options through request', () => {
    service.sendHttpRequest(options);
    expect(request).toHaveBeenCalledWith(
      {
        hostname: 'some.host',
        path: '/path/to/resource',
        method: 'GET',
      },
      expect.any(Function),
    );
  });
});
