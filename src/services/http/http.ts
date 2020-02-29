import { request, RequestOptions } from 'http';

export type HttpRequestOptions = {
  hostname: string;
  path: string;
  method: 'GET';
};

export type HttpResponse = {
  statusCode: number | 'none';
  body: any;
};

type ParsedHttpResponse =
  | { statusCode: number; kind: 'success'; body: any }
  | { statusCode: number; kind: 'failed'; body: any };

export class HttpService {
  private static transformOptions(option: HttpRequestOptions): RequestOptions {
    return option;
  }

  sendHttpRequest(
    httpRequestOptions: HttpRequestOptions,
  ): Promise<HttpResponse> {
    const options = HttpService.transformOptions(httpRequestOptions);
    return new Promise((resolve, reject) => {
      const req = request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () =>
          resolve({
            statusCode: res.statusCode ?? 'none',
            body: data,
          }),
        );
      });
      req.on('error', error => reject(error));
      req.end();
    });
  }

  parseHttpResponse({ statusCode, body }: HttpResponse): ParsedHttpResponse {
    if (statusCode === 'none') {
      throw new Error('http service internal error');
    }
    if (200 <= statusCode && statusCode < 300) {
      return { kind: 'success', statusCode, body };
    }
    return { kind: 'failed', statusCode, body };
  }
}
