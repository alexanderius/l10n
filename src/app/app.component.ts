import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

import { UserContextService } from './_services/user-context.service';
import { ProjectService } from './_services/project.service';

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
    public authService: AuthService,
    public userContextService: UserContextService,
    public projectService: ProjectService
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

            // Получаем данные пользователя и проекты
            this.userContextService.getUserAndTeam().subscribe({
              next: (response) => {
                const teamName = response.teamName;

                // Загружаем проекты пользователя через ProjectService
                this.projectService.loadProjectsFromDb();
                this.router.navigate([`/teams/${teamName}/projects`]);
              },
            });
          });
        }
      });
  }
}
