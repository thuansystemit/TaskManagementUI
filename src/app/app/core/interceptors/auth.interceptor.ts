import { Injectable } from '@angular/core';
import {
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler,
  HttpEvent, 
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req.clone({ withCredentials: true });
    
    // Attach access token if available (fixed method call)
    const token = this.auth.getAccessToken;
    
    if (token) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401 for non-auth endpoints
        if (error.status === 401 &&
            !req.url.includes('/api/auth/login') &&
            !req.url.includes('/api/auth/refresh')) {
          
          return this.handle401Error(req, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.auth.refresh().pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          
          if (success) {
            const newToken = this.auth.getAccessToken
            this.refreshTokenSubject.next(newToken);
            
            // Retry original request with new token
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            
            return next.handle(retryReq);
          } else {
            this.handleAuthError();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.handleAuthError();
          return throwError(() => err);
        })
      );
    } else {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          const token = this.auth.getAccessToken;
          const retryReq = req.clone({
            withCredentials: true,
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(retryReq);
        })
      );
    }
  }

  private handleAuthError(): void {
    this.auth.logout(); // Clear tokens
    this.router.navigate(['/login']);
  }
}