import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideRouter, withRouterConfig } from "@angular/router";
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })), provideAnimations(), provideHttpClient()]
};
