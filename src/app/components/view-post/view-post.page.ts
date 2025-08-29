import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, IonFooter, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, home, camera, extensionPuzzle, colorPalette } from 'ionicons/icons';
import { DataService, Post } from '../../services/data.service';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.page.html',
  styleUrls: ['./view-post.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, IonFooter, IonTabBar, IonTabButton],
})
export class ViewPostPage implements OnInit {
  public post!: Post;
  private data = inject(DataService);
  private activatedRoute = inject(ActivatedRoute);
  private platform = inject(Platform);
  private router = inject(Router);

  constructor() {
    addIcons({ personCircle, home, camera, extensionPuzzle, colorPalette });
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.data.getPostById(parseInt(id, 10)).subscribe({
      next: (post) => {
        this.post = post;
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios')
    return isIos ? 'Posts' : '';
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  isCurrentPage(page: string): boolean {
    return this.router.url === `/${page}`;
  }
}
