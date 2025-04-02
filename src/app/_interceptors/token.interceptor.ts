import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function tokenInterceptor(
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<any> {
  const accessToken = sessionStorage.getItem('accessToken');

  const modifiedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(modifiedRequest);
}
