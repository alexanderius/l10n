import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Team {
  teamId: string;
  teamName: string;
  teamRoles?: number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface UserContext {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  teams: Team[];
  phone?: string;
  passwordHash?: string;
  passwordSalt?: string;
  isLocked?: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  private userInfoSubject = new BehaviorSubject<UserContext | null>(null);
  public userInfo$: Observable<UserContext | null> =
    this.userInfoSubject.asObservable();

  constructor() {}

  getCurrentContext(): UserContext | null {
    return this.userInfoSubject.value;
  }

  updateUserInfo(userInfo: UserContext) {
    console.log('Updating UserContextService with:', userInfo);
    this.userInfoSubject.next(userInfo);
  }
}
