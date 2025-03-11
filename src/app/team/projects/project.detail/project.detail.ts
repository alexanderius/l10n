import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-detail',
  imports: [],
  templateUrl: './project.detail.html',
  styleUrls: ['./project.detail.scss'],
  standalone: true,
})
export class ProjectDetailComponent implements OnInit {
  projectName: string = '';
  constructor(private router: Router) {}

  ngOnInit() {}

  onInputChange(event: any) {
    this.projectName = event.target.value;
  }

  saveProject() {
    console.log('Saving project with name:', this.projectName);
  }
}
