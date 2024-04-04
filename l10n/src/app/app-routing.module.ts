import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './team/team.component';
import { ProjectsComponent } from './team/projects/projects.component';
import { ProjectComponent } from './team/project/project.component';
import { TeamsComponent } from './teams/teams.component';

const routes: Routes = [
  { path: 'teams', component: TeamsComponent },
  {
    path: 'teams/:teamId', component: TeamComponent,
    children: [
      { path: 'projects', component: ProjectsComponent }, 
      { path: 'projects/:projectId', component: ProjectComponent }, 
      { path: 'projects', redirectTo: 'teams/:teamId/projects/default/', pathMatch: 'full' }
    ]
  }, 
  { path: '**', redirectTo: 'teams/default/projects/default/', pathMatch: 'full' },
  { path: '', redirectTo: 'teams', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
