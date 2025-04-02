import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { AuthService } from '@auth0/auth0-angular';
import { UserContextService } from './_services/user-context.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'l10n';

  constructor(
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    public userContextService: UserContextService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(take(1))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.authService.getAccessTokenSilently().subscribe((accessToken) => {
            sessionStorage.setItem('accessToken', accessToken);
            this.checkUserExists();
          });
        } else {
          this.authService.loginWithRedirect();
        }
      });
  }

  checkUserExists() {
    this.http.get('http://localhost:3000/checkuser').subscribe({
      next: (response: any) => {
        if (response.userExists) {
          this.http.get('http://localhost:3000/user/fulldata').subscribe({
            next: (userData: any) => {
              const currentContext =
                this.userContextService.getCurrentContext();
              const updatedContext = { ...currentContext, ...userData };
              this.userContextService.updateUserInfo(updatedContext);
              this.router.navigate(['/teams']);
            },
          });
        } else {
          this.router.navigate(['/user-profile']);
        }
      },
    });
  }
}
