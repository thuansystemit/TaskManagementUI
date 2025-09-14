import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { filter, map, Observable, startWith } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.mode';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  vm$!: Observable<{ loading: boolean; user: User | null }>;
  constructor(private auth: AuthService) {
    this.vm$ = this.auth.user$.pipe(
      filter(user => user !== undefined), 
      map(user => ({
        loading: false,
        user: user ?? null,
        role: user?.userRole ?? null
      }))
    );
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
