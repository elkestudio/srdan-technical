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

## 6. Huawei App Gallery Deployment

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
