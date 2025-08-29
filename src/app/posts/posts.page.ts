import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { 
  RefresherCustomEvent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent, 
  IonList, 
  IonButton, 
  IonSpinner,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonCard,
  IonCardContent,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { addIcons } from 'ionicons';
import { 
  refresh, 
  documentText, 
  chevronBack, 
  chevronForward,
  informationCircle,
  wifi,
  wifiOutline,
  trash
} from 'ionicons/icons';

import { DataService, Post } from '@services/data.service';

@Component({
  selector: 'app-posts',
  templateUrl: 'posts.page.html',
  styleUrls: ['posts.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonRefresher, 
    IonRefresherContent, 
    IonList, 
    IonButton, 
    IonSpinner,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonNote,
    IonCard,
    IonCardContent
  ],
})
export class PostsPage implements OnInit, OnDestroy {
  private data = inject(DataService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  
  public posts: Post[] = [];
  public currentPage = 1;
  public isLoading = false;
  public isOnline = true;
  public dataSource = 'API';
  
  constructor() {
    addIcons({ 
      refresh, 
      documentText, 
      chevronBack, 
      chevronForward,
      informationCircle,
      wifi,
      wifiOutline,
      trash
    });
  }

  ngOnInit() {
    this.loadPosts();
    this.setupNetworkListeners();
  }

  ngOnDestroy() {
    this.removeNetworkListeners();
  }

  private async setupNetworkListeners() {
    // Get initial network status
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      const wasOnline = this.isOnline;
      this.isOnline = status.connected;
      
      if (!wasOnline && this.isOnline) {
        this.showToast('Connection restored', 'success');
      } else if (wasOnline && !this.isOnline) {
        this.showToast('You are offline. Showing cached data.', 'warning');
      }
    });
  }

  private async removeNetworkListeners() {
    await Network.removeAllListeners();
  }

  refresh(ev?: any) {
    this.currentPage = 1;
    this.loadPosts(false).then(() => {
      if (ev) {
        (ev as RefresherCustomEvent).detail.complete();
      }
    });
  }

  forceRefresh() {
    this.loadPosts(true);
  }

  async loadPosts(forceRefresh: boolean = false) {
    this.isLoading = true;
    this.dataSource = this.isOnline && !forceRefresh ? 'Cache/API' : forceRefresh ? 'API' : 'Cache';
    
    try {
      this.data.getPosts(this.currentPage, forceRefresh).subscribe({
        next: (posts) => {
          this.posts = posts;
          this.isLoading = false;
          
          // Update data source based on what we got
          if (posts.length > 0 && this.isOnline) {
            this.dataSource = 'API';
          } else if (posts.length > 0) {
            this.dataSource = 'Cache';
          } else {
            this.dataSource = 'No Data';
          }
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.isLoading = false;
          this.dataSource = 'Error';
          this.showToast('Failed to load posts', 'danger');
        }
      });
    } catch (error) {
      console.error('Error loading posts:', error);
      this.isLoading = false;
      this.dataSource = 'Error';
    }
  }

  nextPage() {
    this.currentPage++;
    this.loadPosts();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPosts();
    }
  }

  getPosts(): Post[] {
    return this.posts;
  }

  async showCacheInfo() {
    const cacheInfo = await this.data.getCacheInfo();
    
    const alert = await this.alertController.create({
      header: 'Cache Information',
      message: `
      Cached Pages: ${cacheInfo.totalPages}\n
      Last Cached: ${cacheInfo.lastCached || 'Never'}\n
      Current Status: ${this.isOnline ? 'Online' : 'Offline'}\n
      Data Source: ${this.dataSource}`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async clearCache() {
    const alert = await this.alertController.create({
      header: 'Clear Cache',
      message: 'Are you sure you want to clear all cached posts?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          handler: async () => {
            await this.data.clearCache();
            this.showToast('Cache cleared successfully', 'success');
            // Reload current page
            this.loadPosts(true);
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
