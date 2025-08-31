import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonBadge, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ElkeBattery, BatteryInfo } from 'elke-battery';
import { addIcons } from 'ionicons';
import { 
  refresh, 
  batteryChargingOutline, 
  batteryDeadOutline, 
  batteryFullOutline, 
  batteryHalfOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-plugin',
  templateUrl: 'plugin.page.html',
  styleUrls: ['plugin.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonBadge, IonIcon, IonButton],
})
export class PluginPage implements OnInit, OnDestroy {
  batteryInfo: BatteryInfo | null = null;
  isListening = false;
  callbackId: string | null = null;
  lastUpdated: Date | null = null;

  constructor() {
    // Register icons for use in the template
    addIcons({
      refresh,
      batteryChargingOutline,
      batteryDeadOutline,
      batteryFullOutline,
      batteryHalfOutline
    });
  }

  async ngOnInit() {
    await this.getBatteryInfo();
    await this.startBatteryListener();
  }

  ngOnDestroy() {
    this.stopBatteryListener();
  }

  async getBatteryInfo() {
    try {
      this.batteryInfo = await ElkeBattery.getBatteryInfo();
      this.lastUpdated = new Date();
      console.log('Battery info retrieved:', this.batteryInfo);
    } catch (error) {
      console.error('Error getting battery info:', error);
      // Fallback to demo data if plugin fails
      this.batteryInfo = {
        level: 85,
        isCharging: false,
        isLowBattery: false,
        status: 'unknown'
      };
      this.lastUpdated = new Date();
    }
  }

  async startBatteryListener() {
    try {
      this.callbackId = await ElkeBattery.addBatteryListener((info: BatteryInfo) => {
        console.log('Battery changed:', info);
        this.batteryInfo = info;
        this.lastUpdated = new Date();
      });
      this.isListening = true;
      console.log('Battery listener started with callback ID:', this.callbackId);
    } catch (error) {
      console.error('Error starting battery listener:', error);
      this.isListening = false;
    }
  }

  async stopBatteryListener() {
    if (this.callbackId) {
      try {
        await ElkeBattery.removeBatteryListener(this.callbackId);
        this.isListening = false;
        this.callbackId = null;
        console.log('Battery listener stopped');
      } catch (error) {
        console.error('Error stopping battery listener:', error);
      }
    }
  }

  async refreshBatteryInfo() {
    await this.getBatteryInfo();
  }

  getBatteryIcon(): string {
    if (!this.batteryInfo) return 'battery-charging-outline';
    
    if (this.batteryInfo.isCharging) {
      return 'battery-charging-outline';
    } else if (this.batteryInfo.level < 20) {
      return 'battery-dead-outline';
    } else if (this.batteryInfo.level >= 90) {
      return 'battery-full-outline';
    }
    return 'battery-half-outline';
  }

  getBatteryColor(): string {
    if (!this.batteryInfo) return 'medium';
    
    if (this.batteryInfo.isCharging) {
      return 'success';
    } else if (this.batteryInfo.isLowBattery) {
      return 'danger';
    } else if (this.batteryInfo.level >= 50) {
      return 'success';
    }
    return 'warning';
  }

  getStatusColor(): string {
    if (!this.batteryInfo) return 'medium';
    
    switch (this.batteryInfo.status) {
      case 'charging':
        return 'success';
      case 'full':
        return 'primary';
      case 'discharging':
        return this.batteryInfo.isLowBattery ? 'danger' : 'medium';
      default:
        return 'medium';
    }
  }
}
