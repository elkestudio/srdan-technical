import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Platform, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward } from 'ionicons/icons';
import { Post } from '../../services/data.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IonItem, IonLabel, IonNote, IonIcon],
})
export class PostComponent {
  private platform = inject(Platform);
  @Input() post?: Post;
  isIos() {
    return this.platform.is('ios')
  }
  constructor() {
    addIcons({ chevronForward });
  }
}
