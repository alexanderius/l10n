import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropZoneDirective } from '../../_directives/drop-zone.directive';
import { LocalizationKey } from '../../_models/localization-key.model';
import { saveAs } from 'file-saver';

import { PageMetaService } from '../../_services/page-meta.service';
import { UserContextService } from '../../_services/user-context.service';
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

  currentLocale: string | null = null;
  currentKeyId: string | null = null;

  scrollOffestX = 0;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    this.scrollOffestX = window.scrollX; // horizontal scroll position
  }

  constructor(
    private pageMetaService: PageMetaService,
    private userContextService: UserContextService,
    private utilsService: UtilsService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {
    this.pageMetaService.pageTitle = 'Project Details';
  }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.projectId = params['id'];

    // this.projectService
    //   .getProjectLocalesById(this.projectId)
    //   .subscribe((data) => {
    //     this.project = data.project;
    //     this.fileNames = data.fileNames;
    //     this.locales = data.locales.map((locale) => ({
    //       code: locale,
    //       name: locale,
    //       isRtl: false,
    //     }));

    //     console.log('Locales loaded:', this.locales);
    //   });

    // this.projectService
    //   .getProjectKeyPathById(this.projectId)
    //   .subscribe((data) => {
    //     this.project = data.project;
    //     this.fileNames = data.fileNames;
    //     this.keys = this.flatObjToNested(data.keys);

    //     console.log('Keys loaded:', this.keys);
    //   });

    // this.projectService
    //   .getProjectTranslationById(this.projectId)
    //   .subscribe((data) => {
    //     this.project = data.project;
    //     this.fileNames = data.fileNames;

    //     data.translations.forEach((translation) => {
    //       const locale = translation.fileName.split('.')[0];

    //       if (!this.translations[locale]) {
    //         this.translations[locale] = {};
    //       }

    //       this.translations[locale][translation.keyPath] = {
    //         v: translation.value,
    //         e: false,
    //       };
    //     });

    //     console.log('Translations loaded:', this.translations);
    //   });
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
      const fileName = file.name;
      const localeCode = file.name.substring(0, file.name.indexOf('.'));

      if (this.locales.findIndex((l) => l.code === localeCode) < 0) {
        const localeObject: Locale = {
          code: localeCode,
          name: fileName,
          isRtl: this.containsRTL(e.target?.result as string),
        };

        this.locales.push(localeObject);
        this.translations[localeCode] = {};
      }

      const jsonString = e.target?.result as string;
      let json = JSON.parse(jsonString);

      const flatKeys = this.getFlatKeys(json);

      for (let j = 0; j < flatKeys.length; j++) {
        const keyPathSegments = flatKeys[j].split('.');

        // Проверяем, существует ли уже перевод для этого ключа
        if (!this.translations[localeCode][flatKeys[j]]) {
          this.translations[localeCode][flatKeys[j]] = {
            e: false, // edit mode
            v: null, // value
            humanKey: flatKeys[j], // Сохраняем human-friendly ключ
            translationKeyId: null, // Изначально ID нет
          };
        }

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

          this.translations[localeCode][flatKeys[j]].v =
            keyPathSegmentIndex == keyPathSegments.length ? current : null;
        }
      }

      // Отправляем на сервер и получаем полные данные для рендеринга
      this.projectService
        .saveTranslations(
          this.projectId,
          fileName,
          localeCode,
          this.translations[localeCode]
        )
        .pipe(take(1))
        .subscribe((response: any) => {
          // Обновляем переводы
          for (const key in response.translations[localeCode]) {
            if (!this.translations[localeCode]) {
              this.translations[localeCode] = {};
            }
            this.translations[localeCode][key] =
              response.translations[localeCode][key];
          }
          this.keys = this.flatObjToNested(response.keys);

          console.log(
            'Translations saved successfully:',
            this.keys,
            this.translations
          );
        });
    };
    reader.readAsText(file);
  }

  flatObjToNested(keys: { id: string; humanKey: string }[]): LocalizationKey[] {
    const result: LocalizationKey[] = [];
    const map: { [key: string]: LocalizationKey } = {};

    keys.forEach((keyObj) => {
      const path = keyObj.humanKey.split('.');
      let currentMap = map;
      let currentResult = result;

      for (let i = 0; i < path.length; i++) {
        const segment = path[i];
        let id = keyObj.id;

        // Если это раздел (не последний сегмент), используем его название в качестве id
        if (i < path.length - 1) {
          id = segment;
        }

        if (!currentMap[segment]) {
          const newKey: LocalizationKey = { id: id, humanKey: segment };
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
      const item: LocalizationKey = { id: key, humanKey: key };

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
      if (this.currentLocale && this.currentKeyId) {
        const prevTranslation =
          this.translations[this.currentLocale][this.currentKeyId];
        if (prevTranslation) {
          prevTranslation.e = false;
        }
      }

      // Turn on editing mode for a new cell
      currentEditKey.e = true;
      this.currentLocale = locale;
      this.currentKeyId = keyId;
    }
  }

  exitEditMode(locale: string, keyId: string): void {
    const currentEditKey = this.translations[locale][keyId];

    if (currentEditKey) {
      currentEditKey.e = false;

      // Вызываем обновление перевода для текущего ключа
      this.projectService
        .updateTranslation(
          this.projectId,
          locale,
          keyId, // Use TranslationKeyId
          currentEditKey.v
        )
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            console.log(`Update successful for key ${keyId}`, response);
          },
          error: (error) => {
            console.error(`Update failed for key ${keyId}`, error);
          },
        });
    }
  }

  downloadDocs(locale: any): void {
    const localeCode = locale.code;
    const localeTranslations = this.translations[localeCode];
    const flatTranslations: { [key: string]: string | number | null } = {};

    Object.keys(localeTranslations).forEach((key) => {
      flatTranslations[key] = localeTranslations[key].v;
    });

    const nestedTranslations = this.restoreNestedObj(flatTranslations);

    const blob = new Blob([JSON.stringify(nestedTranslations, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    saveAs(blob, `${localeCode}-update.json`);
  }

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
