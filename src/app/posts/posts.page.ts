import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
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
  
  // Signals for reactive state management
  public posts = signal<Post[]>([]);
  public currentPage = signal<number>(1);
  public isLoading = signal<boolean>(false);
  public isOnline = signal<boolean>(true);
  public dataSource = signal<string>('API');
  
  // Computed values based on signals
  public networkIcon = computed(() => this.isOnline() ? 'wifi' : 'wifi-outline');
  public networkColor = computed(() => this.isOnline() ? 'success' : 'danger');
  public connectionStatus = computed(() => `${this.isOnline() ? 'Online' : 'Offline'} - ${this.dataSource()}`);
  public loadingMessage = computed(() => this.isOnline() ? 'Loading posts from API...' : 'Loading cached posts...');
  public canGoToPreviousPage = computed(() => this.currentPage() > 1 && !this.isLoading());
  
  private networkListener: any = null;
  
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
    
    // Effect to handle network status changes
    effect(() => {
      const online = this.isOnline();
      console.log('Network status changed:', online ? 'Online' : 'Offline');
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
    this.isOnline.set(status.connected);

    // Listen for network changes
    this.networkListener = await Network.addListener('networkStatusChange', (status) => {
      const wasOnline = this.isOnline();
      this.isOnline.set(status.connected);
      
      if (!wasOnline && this.isOnline()) {
        this.showToast('Connection restored', 'success');
      } else if (wasOnline && !this.isOnline()) {
        this.showToast('You are offline. Showing cached data.', 'warning');
      }
    });
  }

  private async removeNetworkListeners() {
    if (this.networkListener) {
      await this.networkListener.remove();
      this.networkListener = null;
    }
  }

  refresh(ev?: any) {
    this.currentPage.set(1);
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
    this.isLoading.set(true);
    const online = this.isOnline();
    this.dataSource.set(online && !forceRefresh ? 'Cache/API' : forceRefresh ? 'API' : 'Cache');
    
    try {
      this.data.getPosts(this.currentPage(), forceRefresh).subscribe({
        next: (posts) => {
          this.posts.set(posts);
          this.isLoading.set(false);
          
          // Update data source based on what we got
          if (posts.length > 0 && this.isOnline()) {
            this.dataSource.set('API');
          } else if (posts.length > 0) {
            this.dataSource.set('Cache');
          } else {
            this.dataSource.set('No Data');
          }
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.isLoading.set(false);
          this.dataSource.set('Error');
          this.showToast('Failed to load posts', 'danger');
        }
      });
    } catch (error) {
      console.error('Error loading posts:', error);
      this.isLoading.set(false);
      this.dataSource.set('Error');
    }
  }

  nextPage() {
    this.currentPage.update(page => page + 1);
    this.loadPosts();
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadPosts();
    }
  }

  getPosts(): Post[] {
    return this.posts();
  }

  async showCacheInfo() {
    const cacheInfo = await this.data.getCacheInfo();
    
    const alert = await this.alertController.create({
      header: 'Cache Information',
      message: `
      Cached Pages: ${cacheInfo.totalPages}\n
      Last Cached: ${cacheInfo.lastCached || 'Never'}\n
      Current Status: ${this.isOnline() ? 'Online' : 'Offline'}\n
      Data Source: ${this.dataSource()}`,
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
