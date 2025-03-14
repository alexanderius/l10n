import { Injectable } from '@angular/core';
import { UserContextService } from './user-context.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  team: string;
  locales: any[];
  keys: any[];
  translations: any;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectsKey = 'projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);

  projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  constructor(private userContextService: UserContextService) {
    this.initializeProjects();
  }

  private initializeProjects(): void {
    const storedData = localStorage.getItem(this.projectsKey);
    this.projectsSubject.next(storedData ? JSON.parse(storedData) : []);
  }

  createProject(projectName: string): void {
    const teamName = this.userContextService.teamName;

    if (teamName) {
      const newProject: Project = {
        id: Math.random().toString(36).slice(2, 5),
        name: projectName,
        team: teamName,
        locales: [],
        keys: [],
        translations: {},
      };

      const currentProjects = this.projectsSubject.value;
      const updatedProjects = [...currentProjects, newProject];
      localStorage.setItem(this.projectsKey, JSON.stringify(updatedProjects));
      this.projectsSubject.next(updatedProjects);
    }
  }

  getProjectById(projectId: string): Project | undefined {
    const projects = this.projectsSubject.value;
    return projects.find((p: Project) => p.id === projectId);
  }

  deleteProject(projectId: string): void {
    const currentProjects = this.projectsSubject.value;
    const updatedProjects = currentProjects.filter(
      (p: Project) => p.id !== projectId
    );
    localStorage.setItem(this.projectsKey, JSON.stringify(updatedProjects));
    this.projectsSubject.next(updatedProjects);
  }
}
