import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-design',
  templateUrl: 'design.page.html',
  styleUrls: ['design.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
})
export class DesignPage {
  private router = inject(Router);
  
  constructor() {
    addIcons({ arrowBack });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
