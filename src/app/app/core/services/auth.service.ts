// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, Subject } from 'rxjs';
import { tap, map, catchError, finalize, shareReplay, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.mode';
import { RestService } from './rest.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isAuthenticated$ = this.user$.pipe(map(u => !!u));

  private refreshing = false;
  private refreshSubject = new Subject<boolean>();
  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();
  constructor(private api: RestService, private router: Router) {}

  /** Login */
  login(email: string, password: string): Observable<User> {
    return this.api.post<User>('/api/auth/login', { email, password }).pipe(
      tap(user => this.userSubject.next(user)),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  /** Logout */
  logout(): Observable<void> {
    return this.api.post<void>('/api/auth/logout').pipe(
      tap(() => {
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.userSubject.next(null);
        this.router.navigate(['/login']);
        return of();
      })
    );
  }

  /** Load profile from backend */
  loadProfile(): Observable<User | null> {
    return this.api.get<User>('/api/user/profile').pipe(
      tap(user => {
        this.userSubject.next(user);
        this.loadingSubject.next(true);
      }),
      catchError(() => {
        this.userSubject.next(null);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /** Refresh access_token using refresh_token cookie */
  refresh(): Observable<boolean> {
    if (this.refreshing) return this.refreshSubject.asObservable().pipe(take(1));

    this.refreshing = true;

    const call$ = this.api.post<User>('/api/auth/refresh').pipe(
      tap(user => {
        if (user) this.userSubject.next(user);
        this.refreshSubject.next(true);
      }),
      map(() => true),
      catchError(() => {
        this.userSubject.next(null);
        this.refreshSubject.next(false);
        return of(false);
      }),
      finalize(() => { this.refreshing = false; }),
      shareReplay(1)
    );

    call$.subscribe(); // trigger
    return call$;
  }

  /** Current logged-in user */
  get currentUser(): User | null { return this.userSubject.value; }
}
