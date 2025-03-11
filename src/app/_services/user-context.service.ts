import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  constructor(private http: HttpClient) {}

  getUserAndTeam(): Observable<{ userEmail: string; teamName: string }> {
    return this.http.get<{ userEmail: string; teamName: string }>(
      'http://localhost:3000/users/create-team'
    );
  }
}
