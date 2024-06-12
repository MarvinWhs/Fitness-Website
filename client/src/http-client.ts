/* eslint-disable @typescript-eslint/member-ordering */
/* Autor: Marvin Wiechers */

import { createContext } from '@lit/context';
import config from '../config.json';
export const httpClientContext = createContext<HttpClient>('http-client');

export class HttpClient {
  private baseURL!: string;
  private csrfToken: string | null = null;

  init(baseURL: string) {
    this.baseURL = baseURL;
    this.fetchCsrfToken();
  }

  private async fetchCsrfToken() {
    const response = await fetch(`${this.baseURL}csrf-token`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    this.csrfToken = data.csrfToken;
  }

  private async request(method: string, url: string, data?: unknown) {
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRF-Token': this.csrfToken as string
    };

    const response = await fetch(
      this.resolve(`${config.protocol}://${config.serverAdress}:${config.serverPort}` + url),
      {
        method,
        headers,
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined
      }
    );
    return this.result(response);
  }

  async get(url: string) {
    return this.request('GET', url);
  }

  async post(url: string, data: unknown) {
    return this.request('POST', url, data);
  }

  async delete(url: string) {
    const response = await this.request('DELETE', url);
    return response;
  }

  async put(url: string, data: unknown) {
    return this.request('PUT', url, data);
  }

  addQueryString(url: string, params: { [key: string]: string }) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `${url}?${queryString}`;
  }

  private resolve(url: string) {
    return url.startsWith('https') ? url : `${this.baseURL}${url.startsWith('/') ? url.substring(1) : url}`;
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
