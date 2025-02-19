import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageMetaService } from '../../_serivices/page-meta.service';
import { DropZoneDirective } from '../../_directives/drop-zone.directive';
import { LocalizationKey } from '../../_models/localization-key.model';
import { UtilsService } from '../../_serivices/utils.service';
import { saveAs } from 'file-saver';

import { getDataFromDB } from '../../../api/getDataFromDB';
import { saveDataInDB } from '../../../api/saveDataInDB';
import { updateTranslation } from '../../../api/updateTranslation';

export interface Locale {
  code: string;
  name?: string;
  isRtl: boolean;
}

@Component({
  imports: [CommonModule, FormsModule, NgTemplateOutlet, DropZoneDirective],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  standalone: true,
})
export class ProjectComponent {
  locales: Locale[] = [];
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

      if (this.locales.findIndex((l) => l.code === locale) < 0) {
        const localeObject: Locale = {
          code: locale,
          name: locale,
          isRtl: this.containsRTL(e.target?.result as string),
        };

        this.locales.push(localeObject);
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

      updateTranslation(locale, keyId, currentEditKey.v)
        .then((data) => {
          console.log('Translation updated successfully', data);
        })
        .catch((error) => {
          console.error('Error updating translation:', error);
        });
    }
  }

  async downloadDocs(locale: any): Promise<void> {
    const localeTranslations = this.translations[locale.code];
    const flatTranslations: { [key: string]: string | number | null } = {};

    Object.keys(localeTranslations).forEach((key) => {
      flatTranslations[key] = localeTranslations[key].v;
    });

    const nestedTranslations = this.restoreNestedObj(flatTranslations);

    const blob = new Blob([JSON.stringify(nestedTranslations, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    saveAs(blob, `${locale.code}-update.json`);

    // save in DB across server
    saveDataInDB(locale.code, flatTranslations);

    const serverData = await getDataFromDB();
    console.log('Data received from the server:', serverData);
  }

  // Transforming a flatobject into a nested
  restoreNestedObj(flatObject: { [key: string]: any }): any {
    const result: { [key: string]: any } = {};

    Object.keys(flatObject).forEach((key) => {
      const value = flatObject[key];
      const parts = key.split('.');

      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        current[part] = current[part] || {};
        current = current[part];
      }

      current[parts[parts.length - 1]] = value;
    });

    return result;
  }

  containsRTL(text: string): boolean {
    // Regular expression to match RTL Unicode characters
    const rtlRegex =
      /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

    return rtlRegex.test(text);
  }

  resizeTextarea(e: any): void {
    e.target.parentNode.dataset.replicatedValue = e.target.value;
  }
}
