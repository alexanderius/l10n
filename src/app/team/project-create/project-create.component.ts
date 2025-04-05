import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserContextService } from '../../_services/user-context.service';
import { PageMetaService } from '../../_services/page-meta.service';
import { ProjectService } from '../../_services/project.service';

@Component({
  selector: 'app-project-create',
  imports: [FormsModule],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.scss',
  standalone: true,
})
export class ProjectCreateComponent implements OnInit {
  projectName: string = '';
  teamId!: string;

  constructor(
    private userContextService: UserContextService,
    private pageMetaService: PageMetaService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.pageMetaService.pageTitle = 'Project Create';
  }

  ngOnInit(): void {
    this.userContextService.userInfo$.subscribe((userInfo) => {
      if (userInfo && userInfo.teams && userInfo.teams.length > 0) {
        this.teamId = userInfo.teams[0].teamId;

        console.log(this.teamId);
      }
    });
  }

  onCreate() {
    this.projectService.createProject(this.projectName).subscribe({
      next: (response) => {
        const projectId = response.projectId;
        // this.router.navigate(['/teams', this.teamName, 'projects', projectId]);
      },
      error: (error) => {
        console.error('Error creating project:', error);
      },
    });
  }

  onCancel() {
    // this.router.navigate(['/teams', this.teamName, 'projects']);
  }
}
