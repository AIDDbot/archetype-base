export interface HttpClient {
  request(path: string, options?: RequestInit): Promise<Response>;
}
