import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
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
    public authService: AuthService,
    private router: Router,
    private userContextService: UserContextService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(take(1))
      .subscribe((isAuthenticated) => {
        if (!isAuthenticated) {
          this.authService.loginWithRedirect();
        } else {
          this.authService.getAccessTokenSilently().subscribe((accessToken) => {
            sessionStorage.setItem('accessToken', accessToken);

            this.userContextService.getUserAndTeam().subscribe({
              next: (response) => {
                this.router.navigate([`/teams/${response.teamName}/projects`]);
              },
            });
          });
        }
      });
  }
}
