import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PageMetaService } from '../../_services/page-meta.service';

@Component({
  selector: 'app-projects',
  imports: [RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  teamName!: string;

  constructor(
    private pageMetaService: PageMetaService,
    private activatedRoute: ActivatedRoute
  ) {
    this.pageMetaService.pageTitle = 'Projects';
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const teamName = params.get('teamName');
      if (teamName) {
        this.teamName = teamName;
        console.log('Team Name:', this.teamName);
      } else {
        console.warn('Team Name is not available in the URL.');
        this.teamName = 'default-team';
      }
    });
  }
}
