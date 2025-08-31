import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  alertCircle, 
  home, 
  arrowBack
} from 'ionicons/icons';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardContent, 

  ],
})
export class NotFoundPage implements OnInit {
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    addIcons({
      alertCircle,
      home,
      arrowBack
    });
  }

  ngOnInit() {
    // Optional: Log 404 errors for analytics
    console.warn('404 Page Not Found:', this.router.url);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // If no history, go to home
      this.goHome();
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
