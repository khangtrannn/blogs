import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'posts/:id', loadComponent: async () => (await import('./components/post-details/post-details.component')).PostDetailsComponent },
  { path: '', pathMatch: 'full', loadComponent: async () => (await import('./components/main/main.component')).MainComponent }
];
