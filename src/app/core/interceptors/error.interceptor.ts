import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notification.error('Sin conexión a internet');
      } else if (error.status === 401) {
        auth.logout();
      } else if (error.status === 403) {
        notification.error('No tiene permisos para realizar esta acción');
      } else if (error.status >= 500) {
        notification.error('Error del servidor. Intente nuevamente.');
      }
      return throwError(() => error);
    })
  );
};
