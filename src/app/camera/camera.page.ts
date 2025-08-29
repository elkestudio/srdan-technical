import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput,
  IonSpinner,
  IonTextarea,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import QrScanner from 'qr-scanner';
import { addIcons } from 'ionicons';
import { 
  camera, 
  qrCode, 
  checkmarkCircle, 
  alertCircle,
  card,
  person,
  cash,
  stopCircle,
  globe,
  open
} from 'ionicons/icons';

export interface QRData {
  // Serbian banking QR code fields
  recipientAccount: string;     // R: Broj računa primaoca plaćanja
  recipientName: string;        // N: Naziv primaoca plaćanja
  currency: string;             // I: Valuta (RSD)
  amount: string;               // I: Iznos (after currency)
  payerInfo: string;            // P: Podaci o platiocu
  paymentCode: string;          // SF: Šifra plaćanja
  paymentPurpose: string;       // S: Svrha plaćanja
  paymentModel: string;         // RO: Model i Poziv na broj odobrenja
}

export interface QRFieldConfig {
  key: keyof QRData;
  label: string;
  icon: string;
  getValue: (data: QRData) => string;
  hasValue: (data: QRData) => boolean;
}

export enum QRContentType {
  SERBIAN_PAYMENT = 'serbian_payment',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  WIFI = 'wifi',
  TEXT = 'text',
  JSON = 'json'
}

export interface QRContentInfo {
  type: QRContentType;
  title: string;
  icon: string;
  displayData?: any;
}

@Component({
  selector: 'app-camera',
  templateUrl: 'camera.page.html',
  styleUrls: ['camera.page.scss'],
  imports: [
    JsonPipe,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonItem, 
    IonLabel, 
    IonInput,
    IonSpinner,
    IonTextarea
  ],
})
export class CameraPage implements OnInit, OnDestroy {
  @ViewChild('qrVideo', { static: false }) qrVideo!: ElementRef<HTMLVideoElement>;

  public capturedImage: string | null = null;
  public isScanning = signal(false);
  public qrData: QRData | null = null;
  public scanResult = '';
  public rawQRContent = ''; // Store the raw QR code content
  public qrContentInfo: QRContentInfo | null = null;
  
  private qrScanner: QrScanner | null = null;
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({
      camera,
      qrCode,
      checkmarkCircle,
      alertCircle,
      card,
      person,
      cash,
      stopCircle,
      globe,
      open
    });
  }

  ngOnInit() {
    // Initialize QR scanner when component loads
  }

  ngOnDestroy() {
    this.stopScanning();
  }

  async takePictureAndScan() {
    try {
      // Show loading state
      this.isScanning.set(true);
      
      // Take picture with camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        this.capturedImage = image.dataUrl;
        
        // Scan QR code from captured image
        await this.scanQRFromImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      this.showToast('Failed to take picture', 'danger');
      this.isScanning.set(false);
    }
  }

  private async scanQRFromImage(imageDataUrl: string) {
    try {
      // Create an image element from the data URL
      const img = new Image();
      img.src = imageDataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Scan QR code from the image
      const qrResult = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
      
      if (qrResult.data) {
        this.parseQRData(qrResult.data);
        this.showToast('QR Code scanned successfully!', 'success');
      } 
    } catch (error) {
      console.error('Error scanning QR from image:', error);
      this.showToast('Failed to scan QR code from image', 'danger');
    } finally {
      this.isScanning.set(false);
    }
  }

  async scanQRFromCamera() {
    try {
      this.isScanning.set(true);
      
      // Start live QR scanning
      if (this.qrVideo?.nativeElement) {
        this.qrScanner = new QrScanner(
          this.qrVideo.nativeElement,
          (result) => {
            console.log("🚀 ~ CameraPage ~ scanQRFromCamera ~ result:", result)
            this.parseQRData(result.data);
            this.stopScanning();
            this.showToast('QR Code detected from camera!', 'success');
          },
          {
            onDecodeError: (error) => {
              console.log('QR decode error:', error);
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await this.qrScanner.start();
      } else {
        throw new Error('Video element not available');
      }
    } catch (error) {
      console.error('Error starting camera scan:', error);
      this.showToast('Failed to start camera scanning', 'danger');
      this.isScanning.set(false);
    }
  }

  private parseQRData(qrString: string) {
    // Store the raw QR content
    this.rawQRContent = qrString;
    
    // Detect and parse QR content type
    this.qrContentInfo = this.detectQRContentType(qrString);
    
    if (this.qrContentInfo.type === QRContentType.SERBIAN_PAYMENT) {
      this.parseSerbianBankingQR(qrString);
      return;
    }
    
    // For non-banking QR codes, clear banking data
    this.qrData = null;
    this.scanResult = this.qrContentInfo.title;
    
    // Ensure scanning state is reset
    this.isScanning.set(false);
  }

  private detectQRContentType(qrString: string): QRContentInfo {
    // Serbian banking QR code
    if (this.isSerbianBankingQR(qrString)) {
      return {
        type: QRContentType.SERBIAN_PAYMENT,
        title: 'Serbian Banking Payment',
        icon: 'card'
      };
    }

    // URL detection
    if (this.isURL(qrString)) {
      return {
        type: QRContentType.URL,
        title: 'Website Link',
        icon: 'globe',
        displayData: { url: qrString }
      };
    }

    // Email detection
    if (this.isEmail(qrString)) {
      return {
        type: QRContentType.EMAIL,
        title: 'Email Address',
        icon: 'mail',
        displayData: { email: qrString }
      };
    }

    // Phone detection
    if (this.isPhone(qrString)) {
      return {
        type: QRContentType.PHONE,
        title: 'Phone Number',
        icon: 'call',
        displayData: { phone: qrString }
      };
    }

    // WiFi detection
    if (this.isWiFi(qrString)) {
      const wifiData = this.parseWiFi(qrString);
      return {
        type: QRContentType.WIFI,
        title: 'WiFi Network',
        icon: 'wifi',
        displayData: wifiData
      };
    }

    // JSON detection
    if (this.isJSON(qrString)) {
      try {
        const jsonData = JSON.parse(qrString);
        return {
          type: QRContentType.JSON,
          title: 'Structured Data',
          icon: 'code',
          displayData: jsonData
        };
      } catch (error) {
        // Fall through to text
      }
    }

    // Default to plain text
    return {
      type: QRContentType.TEXT,
      title: 'Text Content',
      icon: 'document-text'
    };
  }

  private isURL(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return /^(https?:\/\/|www\.|ftp:\/\/)/i.test(text);
    }
  }

  private isEmail(text: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text) || text.toLowerCase().startsWith('mailto:');
  }

  private isPhone(text: string): boolean {
    const phoneRegex = /^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/;
    return phoneRegex.test(text.replace(/[^\d+]/g, '')) || text.toLowerCase().startsWith('tel:');
  }

  private isWiFi(text: string): boolean {
    return text.startsWith('WIFI:');
  }

  private parseWiFi(text: string): any {
    // Parse WiFi QR format: WIFI:T:WPA;S:NetworkName;P:Password;H:false;
    const wifiData: any = {};
    const parts = text.replace('WIFI:', '').split(';');
    
    for (const part of parts) {
      const [key, value] = part.split(':');
      switch (key) {
        case 'S': wifiData.ssid = value; break;
        case 'P': wifiData.password = value; break;
        case 'T': wifiData.security = value; break;
        case 'H': wifiData.hidden = value === 'true'; break;
      }
    }
    
    return wifiData;
  }

  private isJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return text.trim().startsWith('{') || text.trim().startsWith('[');
    } catch {
      return false;
    }
  }

  private isSerbianBankingQR(qrString: string): boolean {
    // Check if the QR string contains Serbian banking format patterns
    return qrString.includes('K:PR|') && 
           qrString.includes('|R:') && 
           qrString.includes('|N:') && 
           qrString.includes('|I:');
  }

  private parseSerbianBankingQR(qrString: string) {
    // Parse Serbian banking QR code format
    // Example: K:PR|V:01|C:1|R:160000000000060216|N:Telekom Srbija A.D....
    
    const extractField = (fieldCode: string): string => {
      const pattern = new RegExp(`\\|${fieldCode}:([^|]+)`, 'g');
      const match = pattern.exec(qrString);
      return match ? match[1].trim() : '';
    };

    // Extract recipient account (R field)
    const recipientAccount = extractField('R');
    
    // Extract recipient name (N field) - clean up \r\n
    const recipientName = extractField('N').replace(/\\r\\n/g, ' ').trim();
    
    // Extract amount and currency (I field) - format: RSD2549,51
    const amountField = extractField('I');
    const currencyMatch = amountField.match(/^([A-Z]{3})(.+)$/);
    const currency = currencyMatch ? currencyMatch[1] : 'RSD';
    const amount = currencyMatch ? currencyMatch[2] : amountField;
    
    // Extract payer info (P field) - clean up \r\n
    const payerInfo = extractField('P').replace(/\\r\\n/g, ' ').trim();
    
    // Extract payment code (SF field)
    const paymentCode = extractField('SF');
    
    // Extract payment purpose (S field)
    const paymentPurpose = extractField('S');
    
    // Extract model and reference (RO field) with validation
    const rawPaymentModel = extractField('RO');
    const paymentModel = this.validateAndCorrectRO(rawPaymentModel);

    this.qrData = {
      recipientAccount,
      recipientName,
      currency,
      amount,
      payerInfo,
      paymentCode,
      paymentPurpose,
      paymentModel
    };

    this.scanResult = `Recipient: ${recipientName}, Amount: ${currency} ${amount}`;
    this.isScanning.set(false);
    this.showToast('Serbian banking QR code parsed successfully!', 'success');
  }

  private validateAndCorrectRO(roValue: string): string {
    if (!roValue || roValue.length < 2) {
      return roValue;
    }

    // Extract first two digits (model number)
    const modelNumber = roValue.substring(0, 2);
    const referenceNumber = roValue.substring(2);

    // Check if model number is 97 or 11, if not set to 00
    if (modelNumber !== '97' && modelNumber !== '11') {
      return '00' + referenceNumber;
    }

    return roValue;
  }

  stopScanning() {
    if (this.qrScanner) {
      this.qrScanner.stop();
      this.qrScanner.destroy();
      this.qrScanner = null;
      this.isScanning.set(false);
    }
  }


  async proceedWithPayment() {
    if (!this.qrData) {
      this.showToast('No banking data available', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Payment',
      message: `
        Proceed with payment to ${this.qrData.recipientName}?
        
        Amount: ${this.qrData.currency} ${this.qrData.amount}
        Account: ${this.qrData.recipientAccount}
        Purpose: ${this.qrData.paymentPurpose}
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm Payment',
          handler: () => {
            this.processPayment();
          }
        }
      ]
    });

    await alert.present();
  }

  private async processPayment() {
    // Simulate payment processing
    const loadingToast = await this.toastController.create({
      message: 'Processing banking data...',
      duration: 2000
    });
    await loadingToast.present();

    // Simulate processing delay
    await this.delay(2000);
    
    this.showToast('Banking data processed successfully!', 'success');
    this.resetScan();
  }

  resetScan() {
    this.capturedImage = null;
    this.qrData = null;
    this.scanResult = '';
    this.rawQRContent = '';
    this.qrContentInfo = null;
    this.isScanning.set(false);
    this.stopScanning();
  }

  // Get field configurations for display
  getQRFields(): QRFieldConfig[] {
    if (!this.qrData) return [];

    const fields: QRFieldConfig[] = [
      {
        key: 'recipientAccount',
        label: 'Recipient Account Number',
        icon: 'card',
        getValue: (data) => data.recipientAccount,
        hasValue: (data) => !!(data.recipientAccount && data.recipientAccount.trim() !== '')
      },
      {
        key: 'recipientName',
        label: 'Recipient Name',
        icon: 'person',
        getValue: (data) => data.recipientName,
        hasValue: (data) => !!(data.recipientName && data.recipientName.trim() !== '')
      },
      {
        key: 'amount',
        label: 'Currency and Amount',
        icon: 'cash',
        getValue: (data) => `${data.currency} ${data.amount}`,
        hasValue: (data) => !!(data.amount && data.amount.trim() !== '' && data.amount !== '0.00')
      },
      {
        key: 'payerInfo',
        label: 'Payer Information',
        icon: 'person',
        getValue: (data) => data.payerInfo,
        hasValue: (data) => !!(data.payerInfo && data.payerInfo.trim() !== '')
      },
      {
        key: 'paymentCode',
        label: 'Payment Code',
        icon: 'qr-code',
        getValue: (data) => data.paymentCode,
        hasValue: (data) => !!(data.paymentCode && data.paymentCode.trim() !== '')
      },
      {
        key: 'paymentPurpose',
        label: 'Payment Purpose',
        icon: 'card',
        getValue: (data) => data.paymentPurpose,
        hasValue: (data) => !!(data.paymentPurpose && data.paymentPurpose.trim() !== '')
      },
      {
        key: 'paymentModel',
        label: 'Payment Model and Reference',
        icon: 'qr-code',
        getValue: (data) => data.paymentModel,
        hasValue: (data) => !!(data.paymentModel && data.paymentModel.trim() !== '')
      }
    ];

    // Return only fields that have values
    return fields.filter(field => field.hasValue(this.qrData!));
  }

  // Action methods for different QR content types
  openURL(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  sendEmail(email: string) {
    if (email) {
      const mailtoUrl = email.startsWith('mailto:') ? email : `mailto:${email}`;
      window.open(mailtoUrl);
    }
  }

  callPhone(phone: string) {
    if (phone) {
      const telUrl = phone.startsWith('tel:') ? phone : `tel:${phone}`;
      window.open(telUrl);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}

