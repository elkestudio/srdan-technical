# Ionic Build and Deployment Process

## 1. Building Ionic Applications

### Basic Build Process

```bash
# Installing Ionic CLI
npm install -g @ionic/cli

# Creating a new application
ionic start myApp tabs --type=angular

# Building for web
ionic build

# Building for production
ionic build --prod
```

### Custom Plugin Build Process

For projects with local Capacitor plugins (like elke-battery), you need to build the plugin first before building the main application:

```bash
# Build local plugin (elke-battery) first
cd elke-battery
npm install
npm run build
cd ..

# Then install main app dependencies and build
npm install
ionic build --prod
```

### Automated Build Script

To streamline the build process, you can add these scripts to your main `package.json`:

```json
{
  "scripts": {
    "prebuild": "cd elke-battery && npm install && npm run build && cd ..",
    "build": "ng build",
    "build:prod": "npm run prebuild && ionic build --prod",
    "install:all": "npm install && cd elke-battery && npm install && cd ..",
    "build:plugin": "cd elke-battery && npm run build && cd ..",
    "postinstall": "npm run build:plugin"
  }
}
```

This ensures that:
- `npm run build:prod` automatically builds the plugin first
- `npm run install:all` installs dependencies for both main app and plugin
- `postinstall` hook automatically builds the plugin after npm install

### Platform Setup

```bash
# Adding Android platform
ionic capacitor add android

# Adding iOS platform  
ionic capacitor add ios

# Synchronizing code with platforms
ionic capacitor sync
```

## 2. Android Build Process

### Development Build
```bash
# Building for Android development
ionic capacitor build android

# Opening in Android Studio
ionic capacitor open android
```

### Production Build
```bash
# Build local plugin first
cd elke-battery && npm install && npm run build && cd ..

# Production build with optimizations
ionic build --prod
ionic capacitor sync android

# Generating APK file
cd android
./gradlew assembleRelease

# Generating AAB file (recommended for Google Play)
./gradlew bundleRelease
```

### Signing APK/AAB
```bash
# Creating keystore file
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# Configuration in android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('../my-release-key.keystore')
            storePassword 'password'
            keyAlias 'alias_name'
            keyPassword 'password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 3. iOS Build Process

### Development Build
```bash
# Building for iOS development
ionic capacitor build ios

# Opening in Xcode
ionic capacitor open ios
```

### Production Build
```bash
# Build local plugin first
cd elke-battery && npm install && npm run build && cd ..

# Production build
ionic build --prod
ionic capacitor sync ios

# Building in Xcode:
# 1. Open .xcworkspace file
# 2. Configure signing & capabilities
# 3. Archive → Distribute App
```

### iOS Provisioning
- Apple Developer Account required
- Creating App ID
- Generating Distribution Certificate
- Creating Provisioning Profile

## 4. Differences Between Deployment Commands

### Development vs Production

| Command | Purpose | Optimizations | Debugging |
|---------|---------|-------------|-----------|
| `ionic build` | Development | Minimal | Enabled |
| `ionic build --prod` | Production | Tree-shaking, minification, AOT | Disabled |
| `ionic capacitor run android` | Live reload | None | Enabled |
| `ionic capacitor build android` | Final build | Depends on --prod flag | Depends on --prod flag |

### Capacitor vs Cordova
```bash
# Capacitor (modern approach)
ionic capacitor add android
ionic capacitor sync
ionic capacitor run android

# Cordova (legacy)
ionic cordova platform add android
ionic cordova prepare
ionic cordova run android
```

## 5. Build and Deployment Process Automation

### GitHub Actions Configuration

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'adopt'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build local plugin
        run: |
          cd elke-battery
          npm ci
          npm run build
          cd ..
        
      - name: Build Ionic app
        run: |
          ionic build --prod
          ionic capacitor sync android
          
      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleRelease
          
      - name: Upload to Google Play
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.yourapp.package
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build local plugin
        run: |
          cd elke-battery
          npm ci
          npm run build
          cd ..
          
      - name: Build iOS app
        run: |
          ionic build --prod
          ionic capacitor sync ios
          
      - name: Archive and upload to TestFlight
        uses: apple-actions/import-codesign-certs@v1
        with:
          p12-file-base64: ${{ secrets.IOS_DIST_SIGNING_KEY }}
          p12-password: ${{ secrets.IOS_DIST_SIGNING_KEY_PASSWORD }}
```

### Fastlane Automation

```ruby
# fastlane/Fastfile
platform :android do
  desc "Deploy to Google Play Store"
  lane :deploy do
    gradle(task: "bundleRelease")
    upload_to_play_store(
      track: 'production',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab'
    )
  end
end

platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    build_app(
      workspace: "ios/App/App.xcworkspace",
      scheme: "App",
      export_method: "app-store"
    )
    upload_to_app_store
  end
end
```

## 6. Ionic Appflow Deployment

### Appflow Setup and Configuration

Ionic Appflow is a continuous integration and deployment platform designed specifically for Ionic applications. It provides automated builds, live updates, and deployment to app stores.

#### Initial Setup
```bash
# Install Appflow CLI
npm install -g @ionic/cli

# Login to Appflow
ionic login

# Link your app to Appflow
ionic link

# Configure Appflow in your project
ionic config set -g backend pro
```

#### Appflow Configuration File
```json
// appflow.config.json
{
  "apps": [
    {
      "appId": "your-app-id",
      "root": "."
    }
  ]
}
```

### Automated Builds with Appflow

#### Web Build Configuration
```yaml
# Appflow web build configuration
build:
  web:
    commands:
      - npm ci
      - ionic build --prod
    artifacts:
      - www/**
```

#### Native Build Configuration
```yaml
# Appflow native build configuration
build:
  android:
    commands:
      - npm ci
      - ionic build --prod
      - ionic capacitor sync android
    environment:
      - JAVA_VERSION=11
      - ANDROID_SDK_VERSION=31
    
  ios:
    commands:
      - npm ci
      - ionic build --prod
      - ionic capacitor sync ios
    environment:
      - XCODE_VERSION=14.0
```

### Live Updates with Appflow

#### Live Update Setup
```bash
# Install Appflow plugin
npm install @ionic/pro

# Configure live updates
ionic config set app_id "your-app-id"
ionic config set channel_tag "production"
```

#### Live Update Code Integration
```typescript
// src/app/app.component.ts
import { Component } from '@angular/core';
import { Deploy } from '@ionic/pro';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html'
})
export class HomePage {
  
  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      const update = await Deploy.checkForUpdate();
      if (update.available) {
        await Deploy.downloadUpdate((progress) => {
          console.log('Download progress:', progress);
        });
        await Deploy.extractUpdate();
        await Deploy.reloadApp();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  }
}
```

### Appflow Environments and Channels

#### Environment Configuration
```bash
# Create development environment
ionic deploy add --app-id="your-app-id" --channel="development"

# Create staging environment  
ionic deploy add --app-id="your-app-id" --channel="staging"

# Create production environment
ionic deploy add --app-id="your-app-id" --channel="production"
```

#### Channel Management
```bash
# Deploy to specific channel
ionic deploy build --channel="production"

# Set channel for specific commit
ionic deploy manifest --channel="staging" --commit="abc123"

# Rollback to previous version
ionic deploy rollback --channel="production"
```

### Appflow Automation Workflows

#### GitHub Integration
```yaml
# .github/workflows/appflow-deploy.yml
name: Appflow Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy-appflow:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Ionic CLI
        run: npm install -g @ionic/cli
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build and deploy to Appflow
        env:
          IONIC_TOKEN: ${{ secrets.IONIC_TOKEN }}
        run: |
          ionic login --token $IONIC_TOKEN
          ionic deploy build --channel="production"
```

#### Automated Testing with Appflow
```bash
# Run tests before deployment
ionic deploy build --channel="staging" --test-command="npm test"

# Deploy only if tests pass
ionic deploy build --channel="production" --test-command="npm run test:ci"
```

### Appflow Package Builds

#### Android Package Build
```json
{
  "name": "Android Release Build",
  "platform": "android",
  "type": "release",
  "security_profile": "production",
  "environment": {
    "GRADLE_ARGS": "-Pandroid.useAndroidX=true"
  }
}
```

#### iOS Package Build
```json
{
  "name": "iOS App Store Build",
  "platform": "ios", 
  "type": "app-store",
  "security_profile": "production",
  "environment": {
    "CODE_SIGN_STYLE": "Automatic"
  }
}
```

### Appflow Security Profiles

#### Creating Security Profiles
```bash
# Create Android signing profile
ionic package build android --security-profile android-production

# Create iOS signing profile  
ionic package build ios --security-profile ios-production
```

#### Security Profile Configuration
```json
{
  "android": {
    "keystore": "production.keystore",
    "keystore_password": "your-keystore-password",
    "key_alias": "production-key",
    "key_password": "your-key-password"
  },
  "ios": {
    "certificate": "ios-distribution.p12",
    "certificate_password": "your-cert-password",
    "provisioning_profile": "production.mobileprovision"
  }
}
```

### Appflow Monitoring and Analytics

#### Build Monitoring
```typescript
// Monitor build status
import { BuildStatus } from '@ionic/pro';

async function checkBuildStatus(buildId: string) {
  const build = await BuildStatus.get(buildId);
  console.log('Build status:', build.status);
  console.log('Build logs:', build.logs);
}
```

#### Usage Analytics
```typescript
// Track app usage with Appflow
import { Analytics } from '@ionic/pro';

// Track custom events
Analytics.track('feature_used', {
  feature_name: 'camera',
  user_type: 'premium'
});

// Track page views
Analytics.page('home');
```

### Appflow Best Practices

#### Channel Strategy
- **Development**: For testing new features
- **Staging**: For QA and testing before production
- **Production**: For live app updates

#### Version Management
```bash
# Tag releases for better tracking
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Deploy tagged version
ionic deploy build --channel="production" --commit="v1.0.0"
```

#### Rollback Strategy
```bash
# Quick rollback to previous version
ionic deploy rollback --channel="production"

# Rollback to specific version
ionic deploy manifest --channel="production" --commit="previous-commit-hash"
```

## 7. Huawei App Gallery Deployment

### Huawei HMS Setup
```bash
# Adding HMS Core plugin
npm install @hmscore/ionic-native-hms-core

# Configuration in capacitor.config.ts
{
  "plugins": {
    "HMSCore": {
      "appId": "your_huawei_app_id"
    }
  }
}
```

### AGConnect API for Automation
```javascript
// Huawei deployment script
const agconnect = require('@agconnect/cli');

async function deployToAppGallery() {
  await agconnect.upload({
    clientId: process.env.HUAWEI_CLIENT_ID,
    clientSecret: process.env.HUAWEI_CLIENT_SECRET,
    appId: process.env.HUAWEI_APP_ID,
    filePath: './android/app/build/outputs/apk/release/app-release.apk'
  });
}
```

## 7. Recommended Libraries and Extensions

### Build Tools
- **@ionic/cli** - Core Ionic CLI
- **@capacitor/core** - Capacitor runtime
- **@capacitor/android** - Android platform
- **@capacitor/ios** - iOS platform

### CI/CD Tools
- **fastlane** - iOS/Android deployment automation
- **@google-cloud/storage** - Artifact uploads
- **@actions/github** - GitHub Actions integration

### Monitoring & Analytics
- **@capacitor/app** - App lifecycle
- **@capacitor/device** - Device information
- **@ionic/angular** - Angular integration

### Code Quality
- **eslint** - Linting
- **prettier** - Code formatting
- **husky** - Git hooks
- **@commitlint/cli** - Commit message validation

### Testing
- **@angular/testing** - Unit testing
- **protractor** - E2E testing
- **karma** - Test runner

## 8. Best Practices

### Versioning
```json
// package.json
{
  "version": "1.0.0",
  "scripts": {
    "version:patch": "npm version patch && ionic capacitor sync",
    "version:minor": "npm version minor && ionic capacitor sync",
    "version:major": "npm version major && ionic capacitor sync"
  }
}
```

### Environment Configuration
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourapp.com',
  appVersion: require('../../package.json').version
};
```

### Security
- Using Certificate Pinning
- Code obfuscation
- ProGuard for Android
- App Transport Security for iOS

## 9. Troubleshooting

### Common Issues:
- **Gradle build errors**: Update Android Gradle Plugin
- **iOS signing issues**: Check Provisioning Profiles
- **Capacitor sync errors**: Delete node_modules and reinstall
- **Plugin conflicts**: Update to latest versions

### Debug Commands:
```bash
# Verbose build information
ionic capacitor build android --verbose

# Clear cache
ionic capacitor clean

# Check configurations
ionic doctor
```

This process enables complete automation of build and deployment procedures for all three platforms while maintaining maximum control over application quality and security.
