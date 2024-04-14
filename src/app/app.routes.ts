import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import("./features/dashboard/dashboard.routes"),
  },
  { path: "posts", loadChildren: () => import("./features/post/post.routes") },
  {
    path: "",
    pathMatch: "full",
    loadComponent: async () =>
      (await import("./components/main/main.component")).MainComponent,
  },
];
