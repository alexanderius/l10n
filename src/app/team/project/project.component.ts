import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageMetaService } from '../../_serivices/page-meta.service';
import { DropZoneDirective } from '../../_directives/drop-zone.directive';
import { LocalizationKey } from '../../_models/localization-key.model';
import { UtilsService } from '../../_serivices/utils.service';

@Component({
  imports: [CommonModule, FormsModule, NgTemplateOutlet, DropZoneDirective],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  standalone: true,
})
export class ProjectComponent {
  locales: any[] = [];
  keys: LocalizationKey[] = [];
  translations: any = {};

  currenLocale: string | null = null;
  currentKeyId: string | null = null;

  scrollOffestX = 0;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    this.scrollOffestX = window.scrollX; // horizontal scroll position
  }

  constructor(
    private pageMetaService: PageMetaService,
    private utilsService: UtilsService
  ) {
    this.pageMetaService.pageTitle = 'Project Details';
  }

  filesDropped($event: any): any {
    console.log('file(s) dropped', $event);

    if (!$event.files || $event.files.length == 0) {
      return;
    }

    for (let i = 0; i < $event.files.length; i++) {
      const file = $event.files[i].data;

      switch (file.type) {
        case 'application/json':
          this.importFromJson(file);
          break;

        default:
          continue;
      }
    }

    setTimeout(() => {
      console.log(this.translations);
    }, 3000);
  }

  /* JSON processing  */

  importFromJson(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      // assuming file name is the name of locale
      const locale = file.name.substring(0, file.name.indexOf('.'));
      if (this.locales.indexOf(locale) < 0) {
        this.locales.push(locale);
        this.translations[locale] = {};
      }

      const jsonString = e.target?.result as string;
      let json = JSON.parse(jsonString);

      const flatKeys = this.getFlatKeys(json);
      for (let j = 0; j < flatKeys.length; j++) {
        const keyPathSegments = flatKeys[j].split('.');

        this.translations[locale][flatKeys[j]] = {
          e: false, // edit mode
          v: null, // value
        };

        let current = { ...json };
        let keyPathSegmentIndex = 0;
        for (const keyPathSegment of keyPathSegments) {
          keyPathSegmentIndex++;
          // check if the current object has the key
          if (current && keyPathSegment in current) {
            current = current[keyPathSegment]; // move deeper into the object
          } else {
            break;
          }

          this.translations[locale][flatKeys[j]].v =
            keyPathSegmentIndex == keyPathSegments.length ? current : null;

          // console.log(flatKeys[j], current);
        }
      }

      const keys = this.getKeysWithChildren(json);

      this.keys = this.utilsService.mergeArraysById(this.keys, keys);
    };

    reader.readAsText(file);
  }

  // flatten the hierarchy of keys
  getFlatKeys(obj: any, parentKey = ''): any[] {
    let keys: any[] = [];

    for (const key in obj) {
      // Create a new key string with the parent key if it exists
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      // If the value is an object, recurse into it
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(this.getFlatKeys(obj[key], newKey));
      } else {
        // Otherwise, push the new key to the keys array
        keys.push(newKey);
      }
    }

    return keys;
  }

  getKeysWithChildren(obj: any): any[] {
    const result = [];

    for (const key in obj) {
      const item: LocalizationKey = { id: key };

      // check if the value is an object and not null
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively get children
        item.children = this.getKeysWithChildren(obj[key]);
      }

      result.push(item);
    }

    return result;
  }

  editMode(locale: string, keyId: string): void {
    const currentEditKey = this.translations[locale][keyId];

    if (currentEditKey) {
      // Turn off editing mode for the previous cell
      if (this.currenLocale && this.currentKeyId) {
        const prevTranslation =
          this.translations[this.currenLocale][this.currentKeyId];
        if (prevTranslation) {
          prevTranslation.e = false;
        }
      }

      // Turn on editing mode for a new cell
      currentEditKey.e = true;
      this.currenLocale = locale;
      this.currentKeyId = keyId;
    }
  }

  exitEditMode(locale: string, keyId: string): void {
    const currentEditKey = this.translations[locale][keyId];

    if (currentEditKey) {
      currentEditKey.e = false;
    }
  }
}
