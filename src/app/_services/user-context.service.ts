import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserContext } from '../_models/user-context.model';

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
    this.userInfoSubject.next(userInfo);
  }
}
