/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { createContext } from '@lit/context';
export const httpClientContext = createContext<HttpClient>('http-client');

export class HttpClient {
  private baseURL!: string;

  init(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get(url: string) {
    return this.result(await fetch(this.resolve(url)));
  }
  /*Autor: Marvin Wiechers */
  async post(url: string, data: unknown) {
    const response = await fetch(this.resolve(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-PersPl-CSRF-PROTECTION': '13'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return this.result(response);
  }
  addQueryString(url: string, params: { [key: string]: string }) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `${url}?${queryString}`;
  }

  private resolve(url: string) {
    return url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url.substring(1) : url}`;
  }

  private async result(response: Response) {
    if (response.ok) {
      return response;
    } else {
      let message = await response.text();
      try {
        message = JSON.parse(message).message;
      } catch (e) {
        message = (e as Error).message;
      }
      message = message || response.statusText;
      return Promise.reject({ message, statusCode: response.status });
    }
  }
}
