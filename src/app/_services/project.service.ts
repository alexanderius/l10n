import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { UserContextService } from './user-context.service';

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

  createProject(projectName: string): void {
    const teamName = this.userContextService.teamName;

    if (teamName) {
      this.http
        .post<any>('http://localhost:3000/projects', { projectName })
        .subscribe({
          next: (response) => {
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
          },
          error: (error) => {
            console.error('Error creating project:', error);
          },
        });
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

  getProjectById(projectId: string): Observable<Project> {
    return this.http
      .get<any>(`http://localhost:3000/projects/${projectId}`)
      .pipe(
        map((response) => ({
          id: response.project.ProjectId.toString(),
          name: response.project.ProjectName,
          team: this.userContextService.teamName || 'default',
          locales: [],
          keys: [],
          translations: response.translations || {},
          files: response.files || [],
        }))
      );
  }

  saveTranslations(
    projectId: string,
    fileName: string,
    translations: { [key: string]: string | number | null }
  ): Observable<any> {
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
    value: string
  ): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/translation/update`, {
      projectId: projectId,
      fileName: fileName,
      locale: locale,
      keyId: keyId,
      value: value,
    });
  }
}
