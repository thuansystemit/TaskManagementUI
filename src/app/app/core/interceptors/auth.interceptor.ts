import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // always send credentials so backend receives HttpOnly cookies
    const withCredReq = req.clone({ withCredentials: true });

    return next.handle(withCredReq).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // try refresh once
          return this.auth.refresh().pipe(
            switchMap(success => {
              if (success) {
                // retry the original request
                const retryReq = req.clone({ withCredentials: true });
                return next.handle(retryReq);
              } else {
                // refresh failed -> forward error
                return throwError(() => err);
              }
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
