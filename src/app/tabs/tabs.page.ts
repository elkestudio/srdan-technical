import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { apps, newspaper, camera, extensionPuzzle, colorPalette } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private router = inject(Router);

  constructor() {
    addIcons({ apps, newspaper, camera, extensionPuzzle, colorPalette });
  }

  navigateToDesign() {
    this.router.navigate(['/design']);
  }
}
