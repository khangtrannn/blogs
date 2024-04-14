import { Routes } from "@angular/router";

export default <Routes>[
  {
    path: "",
    loadComponent: async () =>
      (await import("./dashboard-container/dashboard-container.component"))
        .DashboardContainerComponent,
  },
];
