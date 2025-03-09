import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  private baseUrl = 'http://localhost:3000';

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side or network
      errorMessage = `An error occured: ${error.error.message}`;
    } else {
      // backend unsuccessfull response code
      errorMessage = `Server returned code: ${error.status}, error message: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getData(): Observable<any> {
    return this.http.get<any>(this.baseUrl).pipe(catchError(this.handleError));
  }

  saveData(fileName: string, translations: any): Observable<any> {
    const requestBody = {
      fileName: fileName,
      translations: translations,
    };

    return this.http
      .post<any>(this.baseUrl, requestBody)
      .pipe(catchError(this.handleError));
  }

  updateTranslation(
    locale: string,
    key: string,
    value: string,
    projectId: number = 1
  ): Observable<any> {
    const requestBody = {
      locale: locale,
      key: key,
      value: value,
      projectId: projectId,
    };

    return this.http
      .post<any>(`${this.baseUrl}/translation/update`, requestBody)
      .pipe(catchError(this.handleError));
  }
}
