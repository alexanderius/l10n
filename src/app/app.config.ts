import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { tokenInterceptor } from './_interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([tokenInterceptor])),

    provideAuth0({
      domain: 'localization-l10n.us.auth0.com',
      clientId: 'VQ7Dzo4nhRbbfHgYECxeHFnv9wjtm9kV',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/teams',
        audience: 'https://api.localization-l10n.com',
      },
    }),
  ],
};
