import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserContextService } from '../_services/user-context.service';

@Component({
  selector: 'app-teams',
  imports: [RouterLink],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  standalone: true,
})
export class TeamsComponent implements OnInit {
  userInfo: any;

  constructor(private userContextService: UserContextService) {}

  ngOnInit(): void {
    this.userContextService.userInfo$.subscribe((data) => {
      this.userInfo = data;
      console.log('User Info:', this.userInfo);
    });
  }

  deleteTeam(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Delete team');
  }
}
