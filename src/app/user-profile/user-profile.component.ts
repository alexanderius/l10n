import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { UserContextService } from '../_services/user-context.service';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
})
export class UserProfileComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    public userContextService: UserContextService
  ) {}

  ngOnInit(): void {}

  saveUserProfile() {
    console.log(this.firstName, this.lastName);
    this.http
      .post('http://localhost:3000/user/info', {
        firstName: this.firstName,
        lastName: this.lastName,
      })
      .subscribe({
        next: (userInfo: any) => {
          console.log('Data from server:', userInfo);
          this.userContextService.updateUserInfo(userInfo);

          console.log(
            'Data from filled context:',
            this.userContextService.getCurrentContext()
          );

          this.router.navigate(['/teams']);
        },
      });
  }
}
