import { Routes } from '@angular/router';
import { ProjectComponent } from './team/project/project.component';
import { ProjectsComponent } from './team/projects/projects.component';
import { TeamComponent } from './team/team.component';
import { TeamsComponent } from './teams/teams.component';
import { ProjectCreateComponent } from './team/project-create/project-create.component';

export const routes: Routes = [
  { path: 'teams', component: TeamsComponent },
  {
    // path: 'teams/:teamId',
    path: 'teams/:teamName',
    component: TeamComponent,
    children: [
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/create', component: ProjectCreateComponent },
      { path: 'projects/:id', component: ProjectComponent },
    ],
  },
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
];
