import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
    loading = false;
    error: string | null = null;

    constructor(private auth: AuthService, private router: Router) {}

    submit() {
      if (this.form.invalid) return this.form.markAllAsTouched();
      this.loading = true;
      this.error = null;
      const { email, password } = this.form.value;
      this.auth.login(email!, password!).pipe(
        switchMap(() => this.auth.loadProfile()), // ⬅ wait for profile here
        catchError(err => {
          this.loading = false;
          this.error = err?.error?.message || 'Login failed';
        return of(null);
    })
    ).subscribe(profile => {
      this.loading = false;
      if (profile) {
        // ⬅ Navigate only after profile is loaded and user$ updated
        this.router.navigate(['/']);
      }
    });
    }
}
