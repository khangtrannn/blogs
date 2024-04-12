import { Routes } from "@angular/router";
import { PostsContainerComponent } from "./post-container/post-container.component";

export default <Routes>[
  {
    path: "",
    component: PostsContainerComponent,
    children: [
      {
        path: ":id",
        loadComponent: async () =>
          (await import("./post-details/post-details.component"))
            .PostDetailsComponent,
      },
    ],
  },
];
