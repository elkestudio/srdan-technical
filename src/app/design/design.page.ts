import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonFooter, IonHeader, IonToolbar, IonGrid, IonRow, IonCol, IonButtons, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home,
  statsChart,
  card,
  logoApple,
  giftOutline,
  caretUpOutline,
  caretForwardOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-design',
  templateUrl: 'design.page.html',
  styleUrls: ['design.page.scss'],
  imports: [IonBadge, IonContent, IonIcon, IonFooter, IonHeader, IonToolbar, IonGrid, IonRow, IonCol],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DesignPage {
  private router = inject(Router);
  
  // Active navigation item
  activeNavItem = 'home'; // Default to home
  
  // Navigation items
  navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'stats', icon: 'stats-chart', label: 'Stats' },
    { id: 'pay', icon: '', label: '', isDummy: true }, // Dummy space for floating button
    { id: 'cards', icon: 'card', label: 'My Cards' },
    { id: 'offers', icon: 'gift-outline', label: 'Offers' }
  ];

  achievements = [
    {
      id: 1,
      title: 'Camping fee',
      amount: '200,00€',
      icon: 'assets/design/van.png',
      gradient: 'linear-gradient(0deg, #2d077e 0%, #8a75b5 50%, #f8f7fb 100%)',
      hasArrow: true
    },
    {
      id: 2,
      title: 'Split Payment',
      amount: '238,50€',
      icon: 'assets/design/big_bang.png',
      gradient: 'linear-gradient(0deg, #4289be 0%, #4e8fc1 50%, #f8f7fb 100%)',
      hasArrow: false
    },
    {
      id: 3,
      title: 'New',
      amount: '120,00€',
      icon: 'assets/design/star.png',
      gradient: 'linear-gradient(0deg, #f8f7fb 0%, #f8f7fb 100%)',
      hasArrow: false
    }
  ];

  transactions = [
    {
      id: 1,
      type: 'Receive',
      description: 'Top-up from Mastercard',
      cardNumber: '*1402',
      amount: '+35,45€',
      icon: 'assets/design/arrow_up_green.png',
      amountColor: '#10b981'
    },
    {
      id: 2,
      type: 'Payment',
      description: 'Big Bang',
      cardNumber: '*4422',
      amount: '-238,50€',
      icon: 'assets/design/big_bang.png',
      amountColor: '#ef4444'
    },
    {
      id: 3,
      type: 'Payment',
      description: 'Camping fee',
      cardNumber: '*1402',
      amount: '-200,00€',
      icon: 'assets/design/van.png',
      amountColor: '#ef4444'
    }
  ];

  constructor() {
    addIcons({
      home,
      statsChart,
      card,
      logoApple,
      giftOutline,
      caretUpOutline,
      caretForwardOutline,
      chevronForwardOutline
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  // Handle navigation item click
  onNavItemClick(itemId: string) {
    this.activeNavItem = itemId;
    // Add navigation logic here if needed
    console.log('Navigation clicked:', itemId);
  }

  // Get color for navigation item
  getNavItemColor(itemId: string): string {
    return this.activeNavItem === itemId ? '#28007d' : '#bfbfc4';
  }
}
