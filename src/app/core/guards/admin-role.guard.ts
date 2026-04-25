import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminRole } from '../../shared/models/auth.model';

const ALLOWED: AdminRole[] = ['ADMIN', 'MANAGER'];

export const adminRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.currentUser()?.role;
  if (role && (ALLOWED as string[]).includes(role)) return true;
  return router.createUrlTree(['/login']);
};
