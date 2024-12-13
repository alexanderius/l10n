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
  locales: any[] = ['en-US', 'ru-RU', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'zh-CN', 'pt-BR', 'ar-SA', 'ko-KR', 'nl-NL', 'sv-SE', 'da-DK', 'fi-FI', 'pl-PL', 'tr-TR', 'hi-IN', 'th-TH'];
  keys: LocalizationKey[] = [{
    id: 'public',
    children: [
      { id: 'signIn' },
      { id: 'signUp' },
      { id: 'signIn1' },
      { id: 'signUp2' },
      { id: 'signIn3' },
      { id: 'signUp4' },
      { id: 'signIn5' },
      { id: 'signUp6' },
      { id: 'signIn7' },
      { id: 'signUp8' },
      { id: 'signIn9' },
      { id: 'signUp10' },
      { id: 'signIn11' },
      { id: 'signUp12' },
      { id: 'signIn13' },
      { id: 'signUp14' },
      { id: 'signIn15' },
      { id: 'signUp16' },
      { id: 'signIn17' },
      { id: 'signUp18' },
      { id: 'signIn19' },
      { id: 'signUp20' },
      { id: 'signIn21' },
      { id: 'signUp22' },
      { id: 'signIn23' },
      { id: 'signUp24' },
    ]
  }, {
    id: 'admin',
    children: [
      { id: 'signIn' },
      { id: 'signUp' },
      { id: 'signIn1' },
      { id: 'signUp2' },
      { id: 'signIn3' },
      { id: 'signUp4' },
      { id: 'signIn5' },
      { id: 'signUp6' },
      { id: 'signIn7' },
      { id: 'signUp8' },
      { id: 'signIn9' },
      { id: 'signUp10' },
      { id: 'signIn11' },
      { id: 'signUp12' },
      { id: 'signIn13' },
      { id: 'signUp14' },
      { id: 'signIn15' },
      { id: 'signUp16' },
      { id: 'signIn17' },
      { id: 'signUp18' },
      { id: 'signIn19' },
      { id: 'signUp20' },
      { id: 'signIn21' },
      { id: 'signUp22' },
      { id: 'signIn23' },
      { id: 'signUp24' },
    ]
  }];
}
