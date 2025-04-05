import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { PageMetaService } from '../../_services/page-meta.service';
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
  teamId!: string;

  constructor(
    private pageMetaService: PageMetaService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {
    this.pageMetaService.pageTitle = 'Projects';
    this.projects$ = this.projectService.projects$;
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const teamId = params.get('teamId');

      if (teamId) {
        this.teamId = teamId;
        this.projectService.getTeamProjects(teamId);

        console.log(this.projects$);
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
