import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export const USER_MANAGEMENT_ROLE = [
  'TEAM_LEAD','PROJECT_MANAGER'] as const;
export type UserManagementRole = (typeof USER_MANAGEMENT_ROLE)[number];

@Injectable({ providedIn: 'root' })
export class PermissionService {
    canViewUserManagement(role: string): boolean {
        return USER_MANAGEMENT_ROLE.includes(role as UserManagementRole);
    }
}
