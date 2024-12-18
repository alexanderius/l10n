import { AfterViewInit, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { PageMetaService } from '../_serivices/page-meta.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  standalone: true,
  imports: [RouterOutlet]
})
export class TeamComponent {

  pageTitle = '';

  constructor(private pageMetaService: PageMetaService) {
        this.pageMetaService.pageTitle$.subscribe((pt) => {
            this.pageTitle = pt!;
        });
    
  }

}
