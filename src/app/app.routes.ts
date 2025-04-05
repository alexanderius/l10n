import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProjectComponent } from './team/project/project.component';
import { ProjectsComponent } from './team/projects/projects.component';
import { TeamComponent } from './team/team.component';
import { TeamsComponent } from './teams/teams.component';
import { ProjectCreateComponent } from './team/project-create/project-create.component';

export const routes: Routes = [
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'teams', component: TeamsComponent },
  {
    path: 'teams/:teamId',
    component: TeamComponent,
    children: [
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/create', component: ProjectCreateComponent },
      { path: 'projects/:id', component: ProjectComponent },
    ],
  },
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
];
