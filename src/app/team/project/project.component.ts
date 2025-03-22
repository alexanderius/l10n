import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropZoneDirective } from '../../_directives/drop-zone.directive';
import { LocalizationKey } from '../../_models/localization-key.model';
import { saveAs } from 'file-saver';

import { PageMetaService } from '../../_services/page-meta.service';
import { ProjectService, Project } from '../../_services/project.service';
import { UtilsService } from '../../_services/utils.service';
import { take } from 'rxjs';

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
  project!: Project;
  projectId!: string;

  locales: Locale[] = [];
  keys: LocalizationKey[] = [];
  translations: any = {};

  currenLocale: string | null = null;
  currentKeyId: string | null = null;

  fileNames: string[] = [];

  scrollOffestX = 0;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    this.scrollOffestX = window.scrollX; // horizontal scroll position
  }

  constructor(
    private pageMetaService: PageMetaService,
    private utilsService: UtilsService,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {
    this.pageMetaService.pageTitle = 'Project Details';
  }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.projectId = params['id'];
    this.fileNames = [];

    this.projectService
      .getProjectLocalesById(this.projectId)
      .subscribe((data) => {
        this.project = data.project;
        this.fileNames = data.fileNames;
        this.locales = data.locales.map((locale) => ({
          code: locale,
          name: locale,
          isRtl: false,
        }));

        console.log('Locales loaded:', this.locales);
      });

    this.projectService
      .getProjectKeyPathById(this.projectId)
      .subscribe((data) => {
        this.project = data.project;
        this.fileNames = data.fileNames;
        this.keys = this.flatObjToNested(data.keys);

        console.log('Keys loaded:', this.keys);
      });

    this.projectService
      .getProjectTranslationById(this.projectId)
      .subscribe((data) => {
        this.project = data.project;
        this.fileNames = data.fileNames;

        data.translations.forEach((translation) => {
          const locale = translation.fileName.split('.')[0];

          if (!this.translations[locale]) {
            this.translations[locale] = {};
          }

          this.translations[locale][translation.keyPath] = {
            v: translation.value,
            e: false,
          };
        });

        console.log('Translations loaded:', this.translations);
      });
  }

  flatObjToNested(keys: { id: string }[]): LocalizationKey[] {
    const result: LocalizationKey[] = [];

    const map: { [key: string]: LocalizationKey } = {};

    keys.forEach((keyObj) => {
      const path = keyObj.id.split('.');
      let currentMap = map;
      let currentResult = result;

      for (let i = 0; i < path.length; i++) {
        const segment = path[i];

        if (!currentMap[segment]) {
          const newKey: LocalizationKey = { id: segment };
          currentMap[segment] = newKey;

          if (i === path.length - 1) {
            currentResult.push(newKey);
          } else {
            newKey.children = [];
            currentResult.push(newKey);
          }
        }

        if (currentMap[segment].children) {
          currentResult = currentMap[segment].children!;
        }

        currentMap = currentMap[segment].children ? {} : currentMap;
      }
    });

    return result;
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

    console.log('ТранслейшенЛокаль:', this.translations);

    setTimeout(() => {
      console.log(this.translations);
    }, 3000);
  }

  /* JSON processing  */
  importFromJson(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const locale = file.name.substring(0, file.name.indexOf('.'));

      if (!this.fileNames) {
        this.fileNames = [];
      }

      if (!this.fileNames.includes(locale)) {
        this.fileNames.push(locale);
      }

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

      this.fileNames.forEach((fileName) => {
        this.projectService
          .updateTranslation(
            this.projectId,
            fileName,
            locale,
            keyId,
            currentEditKey.v
          )
          .pipe(take(1))
          .subscribe({
            next: (response) => {
              console.log(`Update successful for ${fileName}`, response);
            },
            error: (error) => {
              console.error(`Update failed for ${fileName}`, error);
            },
          });
      });
    }
  }

  downloadDocs(locale: any): void {
    if (this.fileNames.length === 0) {
      console.log('No files uploaded. Please upload a file first.');
      return;
    }

    this.fileNames.forEach((fileName) => {
      const localeTranslations = this.translations[fileName];
      const flatTranslations: { [key: string]: string | number | null } = {};

      Object.keys(localeTranslations).forEach((key) => {
        flatTranslations[key] = localeTranslations[key].v;
      });

      const nestedTranslations = this.restoreNestedObj(flatTranslations);

      const blob = new Blob([JSON.stringify(nestedTranslations, null, 2)], {
        type: 'application/json;charset=utf-8',
      });

      saveAs(blob, `${locale.code}-update.json`);

      this.projectService
        .saveTranslations(this.projectId, fileName, flatTranslations)
        .subscribe((res) =>
          console.log(`Data saved successfully for ${fileName}:`, res)
        );
    });
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
