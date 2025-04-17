import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { LocalizationKey } from '../_models/localization-key.model';
import { Locale } from '../_models/localization-locale.model';
import { Project } from '../_models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  saveTranslations(
    projectId: string,
    fileName: string,
    localeCode: string,
    translations: any,
    isRtl: boolean
  ): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/`, {
      projectId: projectId,
      fileName: fileName,
      localeCode: localeCode,
      translations: translations,
      isRtl: isRtl,
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

  getProjectLocalesById(
    projectId: string
  ): Observable<{ project: any; locales: Locale[] }> {
    return this.http
      .get<{ project: any; locales: Locale[] }>(
        `http://localhost:3000/projects/${projectId}/locales`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching locales:', error);
          return of({ project: {}, locales: [] });
        })
      );
  }

  getProjectKeysById(projectId: string): Observable<{
    project: any;
    keys: LocalizationKey[];
  }> {
    return this.http
      .get<{ project: any; keys: LocalizationKey[] }>(
        `http://localhost:3000/projects/${projectId}/keys`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching keys:', error);
          return of({ project: {}, keys: [] });
        })
      );
  }

  getProjectTranslationById(
    projectId: string
  ): Observable<{ project: any; translations: any[] }> {
    return this.http
      .get<{ project: any; translations: any[] }>(
        `http://localhost:3000/projects/${projectId}/translations`
      )
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching translations:', error);
          return of({ project: {}, translations: [] });
        })
      );
  }
}
