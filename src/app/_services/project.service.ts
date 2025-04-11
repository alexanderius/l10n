import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { UserContextService } from './user-context.service';
import { LocalizationKey } from '../_models/localization-key.model';

export interface Project {
  id: string;
  name: string;
  createdAt?: string;
  modifiedAt?: string;
  files: string[];
  locales: any[];
  keys: any[];
  translations: any;
  teamId: string;
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

  getTeamProjects(teamId: string): void {
    this.http
      .get<any>(`http://localhost:3000/teams/${teamId}/projects`)
      .subscribe({
        next: (response) => {
          const projects: Project[] = response.projects.map((p: any) => ({
            id: p.ProjectId.toString(),
            name: p.ProjectName,
            team: teamId,
            files: [],
            locales: [],
            keys: [],
            translations: {},
            createdAt: p.CreatedAt,
            modifiedAt: p.ModifiedAt,
          }));
          this.projectsSubject.next(projects);
        },
        error: (error) => {
          console.error('Error fetching team projects:', error);
        },
      });
  }

  createProject(
    projectName: string,
    teamId: string
  ): Observable<{ projectId: number }> {
    return this.http
      .post<{ projectId: number; projectName: string }>(
        'http://localhost:3000/create-project',
        { projectName, teamId }
      )
      .pipe(
        tap((response) => {
          const newProject: Project = {
            id: response.projectId.toString(),
            name: projectName,
            teamId: teamId!,
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

  ///

  // getProjectLocalesById(
  //   projectId: string
  // ): Observable<{ project: any; locales: string[]; fileNames: string[] }> {
  //   return this.http
  //     .get<{ project: any; locales: string[]; fileNames: string[] }>(
  //       `http://localhost:3000/projects/${projectId}/locales`
  //     )
  //     .pipe(
  //       map((response) => response),
  //       catchError((error) => {
  //         console.error('Error fetching locales:', error);
  //         return of({ project: {}, locales: [], fileNames: [] });
  //       })
  //     );
  // }

  // getProjectKeyPathById(projectId: string): Observable<{
  //   project: any;
  //   keys: LocalizationKey[];
  //   fileNames: string[];
  // }> {
  //   return this.http
  //     .get<{ project: any; keys: LocalizationKey[]; fileNames: string[] }>(
  //       `http://localhost:3000/projects/${projectId}/keys`
  //     )
  //     .pipe(
  //       map((response) => response),
  //       catchError((error) => {
  //         console.error('Error fetching keys:', error);
  //         return of({ project: {}, keys: [], fileNames: [] });
  //       })
  //     );
  // }

  // getProjectTranslationById(
  //   projectId: string
  // ): Observable<{ project: any; translations: any[]; fileNames: string[] }> {
  //   return this.http
  //     .get<{ project: any; translations: any[]; fileNames: string[] }>(
  //       `http://localhost:3000/projects/${projectId}/translations`
  //     )
  //     .pipe(
  //       map((response) => response),
  //       catchError((error) => {
  //         console.error('Error fetching translations:', error);
  //         return of({ project: {}, translations: [], fileNames: [] });
  //       })
  //     );
  // }

  saveTranslations(
    projectId: string,
    fileName: string,
    localeCode: string,
    translations: { [key: string]: string | number | null }
  ): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/`, {
      projectId: projectId,
      fileName: fileName,
      localeCode: localeCode,
      translations: translations,
    });
  }

  updateTranslation(
    projectId: string,
    localeCode: string,
    keyId: string,
    value: string | number | null
  ): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/translation/update`, {
      projectId,
      localeCode,
      keyId,
      value,
    });
  }
}
