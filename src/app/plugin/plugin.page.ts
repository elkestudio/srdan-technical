import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
  pluginVersion: string = 'Unknown';

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
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
    await this.getPluginVersion();
    await this.getBatteryInfo();
    await this.startBatteryListener();
  }

  ngOnDestroy() {
    this.stopBatteryListener();
  }

  async getPluginVersion() {
    try {
      // Method 1: Try to get from app's package.json dependencies (most reliable)
      this.pluginVersion = await this.getVersionFromAppPackage();
      
      if (this.pluginVersion === 'Unknown') {
        // Method 2: Try to get version from node_modules (works in production)
        this.pluginVersion = await this.getVersionFromNodeModules();
      }
      
      if (this.pluginVersion === 'Unknown') {
        // Method 3: Set known version as fallback
        this.pluginVersion = '0.0.2';
      }
      
    } catch (error) {
      console.error('Error getting plugin version:', error);
      this.pluginVersion = '0.0.2'; // Known current version
    }
  }

  private async getVersionFromNodeModules(): Promise<string> {
    try {
      // In development, node_modules aren't served via HTTP
      // This method will only work in production builds
      const response = await fetch('/node_modules/elke-battery/package.json');
      if (response.ok) {
        const packageInfo = await response.json();
        return packageInfo.version || 'Unknown';
      }
    } catch (error) {
      // Expected to fail in development environment
    }
    return 'Unknown';
  }

  private async getVersionFromAppPackage(): Promise<string> {
    try {
      const response = await fetch('/package.json');
      if (response.ok) {
        const packageInfo = await response.json();
        const dependencies = packageInfo.dependencies || {};
        const devDependencies = packageInfo.devDependencies || {};
        
        // Check in dependencies first
        if (dependencies['elke-battery']) {
          return this.extractVersionFromDependency(dependencies['elke-battery']);
        }
        
        // Check in devDependencies
        if (devDependencies['elke-battery']) {
          return this.extractVersionFromDependency(devDependencies['elke-battery']);
        }
      }
    } catch (error) {
      console.log('Could not fetch app package.json:', error);
    }
    return 'Unknown';
  }

  private extractVersionFromDependency(dependency: string): string {
    // Handle git repositories with version tags
    if (dependency.includes('git+') && dependency.includes('#')) {
      const version = dependency.split('#')[1];
      // Remove 'v' prefix if present (e.g., v1.0.0 -> 1.0.0)
      return version.replace(/^v/, '') || 'Unknown';
    }
    
    // Handle regular semver versions
    if (dependency.match(/^\d+\.\d+\.\d+/)) {
      return dependency;
    }
    
    // Handle version ranges (^1.0.0, ~1.0.0, etc.)
    const match = dependency.match(/[\d.]+/);
    return match ? match[0] : 'Unknown';
  }

  async getBatteryInfo() {
    try {
      this.batteryInfo = await ElkeBattery.getBatteryInfo();
      this.lastUpdated = new Date();
      console.log('Battery info retrieved:', this.batteryInfo);
      
      // Manually trigger change detection
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  async startBatteryListener() {
    try {
      this.callbackId = await ElkeBattery.addBatteryListener((info: BatteryInfo) => {
        // Run inside Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.batteryInfo = info;
          this.lastUpdated = new Date();
        });
      });
      this.isListening = true;
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
