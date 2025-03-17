import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface UserContext {
  userEmail: string;
  teamName: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  private userContextSubject = new BehaviorSubject<UserContext | null>(null);
  userContext$ = this.userContextSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserAndTeam(): Observable<UserContext> {
    return this.http
      .get<UserContext>('http://localhost:3000/users/projects')
      .pipe(
        tap((response) => {
          this.userContextSubject.next(response);
        })
      );
  }

  get teamName(): string | undefined {
    return this.userContextSubject.value?.teamName;
  }
}
