import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];