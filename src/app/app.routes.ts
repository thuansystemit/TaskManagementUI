import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UserManagementComponent } from './features/user-management/user-management.component';
import { TaskManagementComponent } from './features/task-management/task-management.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      { path: 'user-management', component: UserManagementComponent },
      { path: 'task-management', component: TaskManagementComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];