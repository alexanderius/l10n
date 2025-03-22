import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { UserContextService } from './user-context.service';
import { LocalizationKey } from '../_models/localization-key.model';

export interface Project {
  id: string;
  name: string;
  team: string;
  files: any[];
  locales: any[];
  keys: any[];
  translations: any;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  constructor(
    private userContextService: UserContextService,
    private http: HttpClient
  ) {}

  loadProjectsFromDb(): void {
    this.http.get<any>('http://localhost:3000/users/projects').subscribe({
      next: (response) => {
        const projects: Project[] = response.projects.map((p: any) => ({
          id: p.ProjectId.toString(),
          name: p.ProjectName,
          team: this.userContextService.teamName || 'default',
          files: [],
          locales: [],
          keys: [],
          translations: {},
        }));
        this.projectsSubject.next(projects);
      },
      error: (error) => {
        console.error('Error fetching user projects:', error);
      },
    });
  }

  createProject(projectName: string): Observable<{ projectId: number }> {
    const teamName = this.userContextService.teamName;

    if (teamName) {
      return this.http
        .post<{ projectId: number; projectName: string }>(
          'http://localhost:3000/projects',
          { projectName }
        )
        .pipe(
          tap((response) => {
            const newProject: Project = {
              id: response.projectId.toString(),
              name: projectName,
              team: teamName,
              files: [],
              locales: [],
              keys: [],
              translations: {},
            };

            const currentProjects = this.projectsSubject.value;
            const updatedProjects = [...currentProjects, newProject];
            this.projectsSubject.next(updatedProjects);
          })
        );
    } else {
      throw new Error('Team name is not defined');
    }
  }

  deleteProject(projectId: string): void {
    this.http
      .delete<any>(`http://localhost:3000/users/projects/${projectId}`)
      .subscribe({
        next: () => {
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = currentProjects.filter(
            (p: Project) => p.id !== projectId
          );
          this.projectsSubject.next(updatedProjects);
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        },
      });
  }

  getProjectLocalesById(
    projectId: string
  ): Observable<{ project: any; locales: string[]; fileNames: string[] }> {
    return this.http
      .get<{ project: any; locales: string[]; fileNames: string[] }>(
        `http://localhost:3000/projects/${projectId}/locales`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching locales:', error);
          return of({ project: {}, locales: [], fileNames: [] });
        })
      );
  }

  getProjectKeyPathById(projectId: string): Observable<{
    project: any;
    keys: LocalizationKey[];
    fileNames: string[];
  }> {
    return this.http
      .get<{ project: any; keys: LocalizationKey[]; fileNames: string[] }>(
        `http://localhost:3000/projects/${projectId}/keys`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching keys:', error);
          return of({ project: {}, keys: [], fileNames: [] });
        })
      );
  }

  getProjectTranslationById(
    projectId: string
  ): Observable<{ project: any; translations: any[]; fileNames: string[] }> {
    return this.http
      .get<{ project: any; translations: any[]; fileNames: string[] }>(
        `http://localhost:3000/projects/${projectId}/translations`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching translations:', error);
          return of({ project: {}, translations: [], fileNames: [] });
        })
      );
  }

  saveTranslations(
    projectId: string,
    fileName: string,
    translations: { [key: string]: string | number | null }
  ): Observable<any> {
    console.log(` Айди передаваемый в эндпоинт на сохранение ${projectId}`);
    console.log(` ФайлНейм передаваемый в эндпоинт на сохранение ${fileName}`);

    return this.http.post<any>(`http://localhost:3000/`, {
      projectId: projectId,
      fileName: fileName,
      translations: translations,
    });
  }

  updateTranslation(
    projectId: string,
    fileName: string,
    locale: string,
    keyId: string,
    value: string | number | null
  ): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/translation/update`, {
      projectId,
      fileName,
      locale,
      keyId,
      value,
    });
  }
}
