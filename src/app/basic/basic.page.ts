import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonList, 
  IonButtons,
  IonNote,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, 
  addCircle, 
  close, 
  card, 
  wallet, 
  trendingUp, 
  home, 
  cardOutline 
} from 'ionicons/icons';

export interface AccountInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
  noteText: string;
  noteColor: string;
}

export interface AccountType {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
}

@Component({
  selector: 'app-basic',
  templateUrl: 'basic.page.html',
  styleUrls: ['basic.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonButtons,
    IonNote,
    IonModal
  ],
})
export class BasicPage {
  private router = inject(Router);
  
  isModalOpen = false;

  // Account data
  accounts: AccountInfo[] = [
    {
      id: 'checking',
      name: 'Checking Account',
      description: 'Available Balance: $2,450.00',
      iconName: 'card',
      iconColor: 'primary',
      noteText: 'Active',
      noteColor: 'success'
    },
    {
      id: 'savings',
      name: 'Savings Account',
      description: 'Available Balance: $12,750.00',
      iconName: 'wallet',
      iconColor: 'secondary',
      noteText: 'Active',
      noteColor: 'success'
    },
    {
      id: 'investment',
      name: 'Investment Portfolio',
      description: 'Current Value: $45,230.00',
      iconName: 'trending-up',
      iconColor: 'tertiary',
      noteText: '+2.5%',
      noteColor: 'warning'
    },
    {
      id: 'mortgage',
      name: 'Mortgage Loan',
      description: 'Remaining Balance: $185,650.00',
      iconName: 'home',
      iconColor: 'danger',
      noteText: '15 years left',
      noteColor: 'medium'
    },
    {
      id: 'credit-card',
      name: 'Credit Card',
      description: 'Current Balance: $1,250.00',
      iconName: 'card-outline',
      iconColor: 'dark',
      noteText: 'Due: Dec 15',
      noteColor: 'danger'
    }
  ];

  // Account types for modal
  accountTypes: AccountType[] = [
    {
      id: 'checking',
      name: 'Checking Account',
      description: 'For everyday transactions',
      iconName: 'card',
      iconColor: 'primary'
    },
    {
      id: 'savings',
      name: 'Savings Account',
      description: 'Earn interest on your deposits',
      iconName: 'wallet',
      iconColor: 'secondary'
    },
    {
      id: 'investment',
      name: 'Investment Account',
      description: 'Grow your wealth over time',
      iconName: 'trending-up',
      iconColor: 'tertiary'
    }
  ];
  
  constructor() {
    addIcons({ 
      add, 
      addCircle, 
      close, 
      card, 
      wallet, 
      trendingUp, 
      home, 
      cardOutline 
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectAccountType(accountType: string) {
    console.log('Selected account type:', accountType);
    // Here you would typically handle the account creation logic
    // For now, we'll just close the modal
    this.closeModal();
  }

  navigateToDesign() {
    this.router.navigate(['/design']);
  }
}
