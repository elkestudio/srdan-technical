import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonFooter, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack, 
  cellular, 
  wifi, 
  batteryFull, 
  arrowDown, 
  home, 
  statsChart, 
  card, 
  person 
} from 'ionicons/icons';

@Component({
  selector: 'app-design',
  templateUrl: 'design.page.html',
  styleUrls: ['design.page.scss'],
  imports: [IonContent, IonIcon, IonFooter, IonHeader],
})
export class DesignPage {
  private router = inject(Router);
  
  constructor() {
    addIcons({ 
      arrowBack, 
      cellular, 
      wifi, 
      batteryFull, 
      arrowDown, 
      home, 
      statsChart, 
      card, 
      person 
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
