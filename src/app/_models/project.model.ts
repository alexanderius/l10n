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
