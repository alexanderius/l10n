import { Routes } from '@angular/router';
import { ProjectComponent } from './team/project/project.component';
import { ProjectsComponent } from './team/projects/projects.component';
import { TeamComponent } from './team/team.component';
import { TeamsComponent } from './teams/teams.component';
import { ProjectDetailComponent } from './team/projects/project.detail/project.detail';

export const routes: Routes = [
  { path: 'teams', component: TeamsComponent },
  {
    // path: 'teams/:teamId',
    path: 'teams/:teamName',
    component: TeamComponent,
    children: [
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/new', component: ProjectDetailComponent },
      { path: 'projects/:projectId', component: ProjectComponent },
      // { path: 'projects/:projectId/edit', component: ProjectDetails },
    ],
  },
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
];
