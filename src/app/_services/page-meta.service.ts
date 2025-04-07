import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageMetaService {
  public pageTitle$ = new BehaviorSubject(this.pageTitle);
  private _pageTitle = '';

  constructor(private titleService: Title) {}

  public set pageTitle(value: string | null | undefined) {
    this._pageTitle = value ?? '';
    this.pageTitle$.next(this._pageTitle);
    this.titleService.setTitle(`${this._pageTitle} | L10n Online`);
  }

  public get pageTitle(): string {
    return this._pageTitle;
  }
}
