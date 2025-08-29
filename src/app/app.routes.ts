import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'basic',
        loadComponent: () => import('./basic/basic.page').then((m) => m.BasicPage),
      },
      {
        path: 'posts',
        loadComponent: () => import('./posts/posts.page').then((m) => m.PostsPage),
      },
      {
        path: 'camera',
        loadComponent: () => import('./camera/camera.page').then((m) => m.CameraPage),
      },
      {
        path: 'plugin',
        loadComponent: () => import('./plugin/plugin.page').then((m) => m.PluginPage),
      },
      {
        path: '',
        redirectTo: 'basic',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'design',
    loadComponent: () => import('./design/design.page').then((m) => m.DesignPage),
  },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./components/view-post/view-post.page').then((m) => m.ViewPostPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

