import { Routes } from '@angular/router';
import { ProjectComponent } from './team/project/project.component';
import { ProjectsComponent } from './team/projects/projects.component';
import { TeamComponent } from './team/team.component';
import { TeamsComponent } from './teams/teams.component';

export const routes: Routes = [
  { path: 'teams', component: TeamsComponent },
  {
    path: 'teams/:teamId', component: TeamComponent,
    children: [
      { path: 'projects', component: ProjectsComponent }, 
      { path: 'projects/:projectId', component: ProjectComponent }, 
    ]
  }, 
  { path: '**', redirectTo: 'teams/default/projects/default/', pathMatch: 'full' },
  { path: '', redirectTo: 'teams', pathMatch: 'full' },

];