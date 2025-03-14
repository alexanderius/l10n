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
  teamName?: string;

  constructor(
    private userContextService: UserContextService,
    private pageMetaService: PageMetaService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.pageMetaService.pageTitle = 'Project Create';
  }

  ngOnInit(): void {
    this.userContextService.userContext$.subscribe((context) => {
      if (context) {
        this.teamName = context.teamName;
      }
    });
  }

  onCreate() {
    if (this.teamName) {
      this.projectService.createProject(this.projectName);
      this.router.navigate(['/teams', this.teamName, 'projects']);
    }
  }

  onCancel() {
    if (this.teamName) {
      this.router.navigate(['/teams', this.teamName, 'projects']);
    }
  }
}
