import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'l10n';

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isAuthenticated$.pipe(take(1)).subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.auth.loginWithRedirect({
          appState: { target: '/teams/default/projects' },
        });
      }
    });
  }
}
