import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

interface LocalizationKey {
  id: string;
  children?: LocalizationKey[];
}

@Component({
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  standalone: true
})
export class ProjectComponent {
  locales: any[] = ['en-US', 'es-ES', 'de-DE'];
  keys: LocalizationKey[] = [{
    id: 'public',
    children: [
      { id: 'signIn' },
      { id: 'signUp' },
    ]
  }];
}
