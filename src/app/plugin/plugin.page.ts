import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-plugin',
  templateUrl: 'plugin.page.html',
  styleUrls: ['plugin.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class PluginPage {
  constructor() {}
}
