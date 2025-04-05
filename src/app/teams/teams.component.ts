import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { UserContextService } from '../_services/user-context.service';
import { UserContext } from '../_models/user-context.model';

@Component({
  selector: 'app-teams',
  imports: [RouterLink, CommonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  standalone: true,
})
export class TeamsComponent implements OnInit {
  userInfo: any;

  constructor(
    public userContextService: UserContextService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userContextService.userInfo$.subscribe((data) => {
      this.userInfo = data;
    });
  }

  createTeam() {
    this.http
      .get('http://localhost:3000/create-team', {})
      .subscribe((response: any) => {
        const newTeam = response.teams?.find(
          (team: any) =>
            !this.userContextService
              .getCurrentContext()
              ?.teams.find((ct) => ct.teamId === team.teamId)
        );

        const currentContext = this.userContextService.getCurrentContext();

        if (currentContext) {
          const updatedContext: UserContext = {
            ...currentContext,
            teams: [
              ...currentContext.teams,
              {
                teamId: newTeam.teamId,
                teamName: newTeam.teamName,
              },
            ],
          };

          this.userContextService.updateUserInfo(updatedContext);
        }
      });
  }

  deleteTeam(teamId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.http.delete(`http://localhost:3000/delete-team/${teamId}`).subscribe({
      next: () => {
        const currentContext = this.userContextService.getCurrentContext();

        if (currentContext) {
          const updatedTeams = currentContext.teams.filter(
            (team) => team.teamId !== teamId
          );

          const updatedContext: UserContext = {
            ...currentContext,
            teams: updatedTeams,
          };

          this.userContextService.updateUserInfo(updatedContext);
        }
      },
      error: (error) => {
        console.error('Ошибка при удалении команды:', error);
      },
    });
  }
}
