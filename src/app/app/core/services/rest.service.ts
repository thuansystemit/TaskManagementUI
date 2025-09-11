import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RestService {
  base = environment.API.BASE_URL;
  constructor(private http: HttpClient) {}
  get<T>(path: string) {
    return this.http.get<T>(this.base + path, {
        withCredentials: true
    });
  }

  post<T>(path: string, body?: any) {
    return this.http.post<T>(this.base + path, body, {
        withCredentials: true
    });
  }

  put<T>(path: string, body?: any) {
    return this.http.put<T>(this.base + path, body, {
        withCredentials: true
    });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.base + path, {
        withCredentials: true
    });
  }
}
