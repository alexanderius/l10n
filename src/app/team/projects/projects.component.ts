import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { PageMetaService } from '../../_services/page-meta.service';
import { ProjectService, Project } from '../../_services/project.service';
import { UserContextService } from '../../_services/user-context.service';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  projects$: Observable<Project[]>;
  teamName?: string;

  constructor(
    private pageMetaService: PageMetaService,
    private userContextService: UserContextService,
    private projectService: ProjectService
  ) {
    this.pageMetaService.pageTitle = 'Projects';
    this.projects$ = this.projectService.projects$;
  }

  ngOnInit(): void {
    this.userContextService.userContext$.subscribe((context) => {
      if (context) {
        this.teamName = context.teamName;
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
