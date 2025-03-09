import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageMetaService } from '../../_services/page-meta.service';

@Component({
  imports: [RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  constructor(private pageMetaService: PageMetaService) {
    this.pageMetaService.pageTitle = 'Projects';
  }
  ngOnInit(): void {}
}
