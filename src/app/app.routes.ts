import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "posts", loadChildren: () => import("./posts/post.routes") },
  {
    path: "",
    pathMatch: "full",
    loadComponent: async () =>
      (await import("./components/main/main.component")).MainComponent,
  },
];
