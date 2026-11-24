import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token-interceptor';

// Para que las fechas se muestren en español (ej: 1 nov 2026)
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // El interceptor agrega el token a todas las peticiones
    provideHttpClient(withInterceptors([tokenInterceptor])),
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};
