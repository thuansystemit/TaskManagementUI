import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { RouterModule } from '@angular/router';
import { User } from '../../../core/models/user.mode';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() user: User | null = null;

  constructor(private auth: AuthService, private permission: PermissionService) {}

  logout() {
    this.auth.logout().subscribe();
  }
  canViewUserManagement(role: string) {
    return this.permission.canViewUserManagement(role);
  }
}
