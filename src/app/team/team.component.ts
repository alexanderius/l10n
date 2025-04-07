import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { PageMetaService } from '../_services/page-meta.service';
import { UserContextService } from '../_services/user-context.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class TeamComponent implements OnInit {
  pageTitle = '';

  constructor(
    private pageMetaService: PageMetaService,
    private route: ActivatedRoute,
    private userContextService: UserContextService
  ) {
    this.pageMetaService.pageTitle$.subscribe((pt) => {
      this.pageTitle = pt!;
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const teamId = params['teamId'];

      if (teamId) {
        const currentContext = this.userContextService.getCurrentContext();

        if (currentContext) {
          const updatedContext = {
            ...currentContext,
            currentTeamId: teamId,
          };

          this.userContextService.updateUserInfo(updatedContext);
        }
      }
    });
  }
}
