import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth.service';

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error as { message?: string } | null;
  if (body?.message && typeof body.message === 'string') return body.message;
  return 'Error del servidor. Intente de nuevo.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);
  const notification = inject(NzNotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      } else if (err.status === 403) {
        notification.error('Sin acceso', 'No tiene permisos para esta acción');
      } else if (err.status >= 500) {
        message.error(extractMessage(err));
      }
      // 4xx (excepto 401/403) se dejan pasar sin mensaje del interceptor
      // para que el componente muestre el error específico
      return throwError(() => err);
    })
  );
};
