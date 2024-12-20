import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PageMetaService } from '../../_serivices/page-meta.service';
import { DropZoneDirective } from '../../_directives/drop-zone.directive';

interface LocalizationKey {
  id: string;
  children?: LocalizationKey[];
}

@Component({
  imports: [CommonModule, NgTemplateOutlet, DropZoneDirective],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  standalone: true
})
export class ProjectComponent {
  locales: any[] = [];
  keys: LocalizationKey[] = [];

  scrollOffestX = 0;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    this.scrollOffestX = window.scrollX; // horizontal scroll position
  }

  constructor(private pageMetaService: PageMetaService) {
    this.pageMetaService.pageTitle = 'Project Details';
  }

  filesDropped($event: any): any {
    console.log('file(s) dropped', $event);
  }
}
