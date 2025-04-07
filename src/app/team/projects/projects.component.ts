import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { PageMetaService } from '../../_services/page-meta.service';
import { UserContextService } from '../../_services/user-context.service';
import { ProjectService, Project } from '../../_services/project.service';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  projects$: Observable<Project[]>;
  teamId: string | undefined;

  constructor(
    private pageMetaService: PageMetaService,
    private userContextService: UserContextService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {
    this.projects$ = this.projectService.projects$;
    this.pageMetaService.pageTitle = 'Projects';
  }

  ngOnInit(): void {
    this.userContextService.userInfo$.subscribe((userInfo) => {
      this.teamId = userInfo?.currentTeamId;

      if (this.teamId) {
        this.projectService.getTeamProjects(this.teamId);
      }
    });
  }

  deleteProject(event: Event, projectId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId);
    }
  }
}
