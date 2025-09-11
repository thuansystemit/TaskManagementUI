import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { filter, map, Observable, startWith } from 'rxjs';
import { AuthService } from '../app/core/services/auth.service';
import { User } from '../app/core/models/user.mode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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
        user: user ?? null
      }))
    );
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
