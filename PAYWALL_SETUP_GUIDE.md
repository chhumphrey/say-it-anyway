
# Paywall & Ad Configuration Setup Guide

This guide will help you complete the setup of your in-app purchases, paywalls, and ads for "Say It Anyway: Grief Journal."

## 📋 Overview

Your app now has the foundation for:
- ✅ Superwall integration with proper hooks-based SDK
- ✅ Monthly subscription ($2.50/month)
- ✅ Consumable extra recording time ($2.00)
- ✅ AdMob banner ads for free users
- ✅ Access code system for testing

## 🚀 What's Been Implemented

### 1. **Superwall Integration** ✅
- App wrapped with `SuperwallProvider` in `app/_layout.tsx`
- Proper loading, error, and loaded states
- Hooks-based API using `usePlacement` and `useUser`
- Graceful fallback for Expo Go and web

### 2. **Subscription Context** ✅
- Syncs with Superwall subscription status
- Manages local subscription state
- Handles ad visibility logic
- Supports access code unlocking for testing

### 3. **Billing Service** ✅
- Simplified to work with Superwall hooks
- Manages recording time pools
- Handles subscription activation/deactivation

### 4. **Settings Screen** ✅
- Uses Superwall's `usePlacement` for purchases
- Uses Superwall's `useUser` for restore
- Proper error handling and user feedback

## ⚠️ Outstanding Configuration Tasks

### **CRITICAL: Superwall Dashboard Setup**

You need to configure your Superwall dashboard to make purchases work:

#### Step 1: Create Superwall Account
1. Go to https://superwall.com
2. Sign up or log in
3. Create a new app for "Say It Anyway: Grief Journal"

#### Step 2: Get Your API Key
1. In Superwall dashboard, go to Settings > API Keys
2. Copy your API key
3. Replace the placeholder in `constants/BillingConfig.ts`:
   ```typescript
   superwall: {
     apiKey: 'YOUR_ACTUAL_API_KEY_HERE', // Replace this!
   }
   ```

#### Step 3: Configure Products in Superwall
1. Go to Products section in Superwall dashboard
2. Add your subscription product:
   - **Product ID**: `com.sayitanyway.subscription.monthly`
   - **Type**: Auto-renewable subscription
   - **Price**: $2.50/month
   - **Description**: "60 minutes of Recording Time per month, no ads"

3. Add your consumable product:
   - **Product ID**: `com.sayitanyway.extratime`
   - **Type**: Consumable
   - **Price**: $2.00
   - **Description**: "60 minutes of extra recording time (rolls over)"

#### Step 4: Create Placements
1. Go to Placements section in Superwall dashboard
2. Create placement: **`subscription_purchase`**
   - Link to your subscription product
   - Design your paywall (use Superwall's visual editor)
   - Set up triggers and rules

3. Create placement: **`extra_time_purchase`**
   - Link to your extra time product
   - Design your paywall
   - Set up triggers and rules

#### Step 5: Design Your Paywalls
Use Superwall's visual paywall editor to create beautiful paywalls:
- Add compelling copy about the benefits
- Show pricing clearly
- Include screenshots or illustrations
- Add a restore purchases button
- Test different designs with A/B testing

### **CRITICAL: App Store Connect Setup (iOS)**

#### Step 1: Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create your app if not already created
3. Fill in all required metadata

#### Step 2: Create In-App Purchase Products
1. Go to your app > Features > In-App Purchases
2. Create **Auto-Renewable Subscription**:
   - **Product ID**: `com.sayitanyway.subscription.monthly`
   - **Reference Name**: "Monthly Subscriber"
   - **Subscription Group**: Create new group "Say It Anyway Subscriptions"
   - **Subscription Duration**: 1 month
   - **Price**: $2.50 USD (set for all territories)
   - **Localized Description**: "Get 60 minutes of recording time per month and remove all ads"

3. Create **Consumable**:
   - **Product ID**: `com.sayitanyway.extratime`
   - **Reference Name**: "Extra Recording Time"
   - **Price**: $2.00 USD
   - **Localized Description**: "Add 60 minutes of recording time that never expires"

4. Submit products for review

#### Step 3: Configure Subscription Details
1. Set up subscription group information
2. Add promotional images
3. Configure subscription renewal and cancellation policies
4. Set up subscription offers (optional)

### **CRITICAL: Google Play Console Setup (Android)**

#### Step 1: Create App in Google Play Console
1. Go to https://play.google.com/console
2. Create your app if not already created
3. Fill in all required metadata

#### Step 2: Create In-App Products
1. Go to Monetize > Products > Subscriptions
2. Create subscription:
   - **Product ID**: `com.sayitanyway.subscription.monthly`
   - **Name**: "Monthly Subscriber"
   - **Description**: "Get 60 minutes of recording time per month and remove all ads"
   - **Billing Period**: 1 month
   - **Price**: $2.50 USD (set for all countries)

3. Go to Monetize > Products > In-app products
4. Create consumable:
   - **Product ID**: `com.sayitanyway.extratime`
   - **Name**: "Extra Recording Time"
   - **Description**: "Add 60 minutes of recording time that never expires"
   - **Price**: $2.00 USD

5. Activate products

### **IMPORTANT: AdMob Setup**

#### Step 1: Create AdMob Account
1. Go to https://apps.admob.com
2. Sign up or log in with your Google account
3. Accept terms and conditions

#### Step 2: Add Your App
1. Click "Apps" in the sidebar
2. Click "Add App"
3. Select iOS and add your app (or enter details if not published yet)
4. Repeat for Android

#### Step 3: Create Ad Units
1. Go to your iOS app > Ad units
2. Click "Add Ad Unit"
3. Select "Banner"
4. Name it "Home Banner" or similar
5. Copy the Ad Unit ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)
6. Repeat for Android app

#### Step 4: Update Configuration
Replace the test IDs in `constants/BillingConfig.ts`:
```typescript
adUnits: {
  banner: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your iOS Ad Unit ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your Android Ad Unit ID
  },
},
```

#### Step 5: Update app.json
Make sure your AdMob App IDs are in `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
        }
      ]
    ]
  }
}
```

## 🧪 Testing Your Setup

### Testing in Development

**IMPORTANT**: In-app purchases and Superwall **DO NOT work in Expo Go**. You must create a development build:

```bash
# Install expo-dev-client if not already installed
npx expo install expo-dev-client

# Create development build for iOS
npx expo run:ios

# Create development build for Android
npx expo run:android
```

### Testing Subscriptions

1. **iOS Sandbox Testing**:
   - Add sandbox test users in App Store Connect
   - Sign out of your Apple ID in Settings > App Store
   - When prompted during purchase, sign in with sandbox account
   - Subscriptions renew every 5 minutes in sandbox

2. **Android Testing**:
   - Add test accounts in Google Play Console
   - Use internal testing track
   - Purchases are not charged for test accounts

3. **Test Scenarios**:
   - ✅ Subscribe to monthly plan
   - ✅ Verify recording time is granted (60 minutes)
   - ✅ Verify ads are removed
   - ✅ Purchase extra time as subscriber
   - ✅ Verify extra time is added
   - ✅ Restore purchases on new device
   - ✅ Let subscription expire (5 min in sandbox)
   - ✅ Verify reversion to free tier

### Testing Ads

1. **Test Ads Load**: Ads should show on Home and Message List screens for free users
2. **Test Ad Removal**: Subscribe and verify ads disappear
3. **Test Ad Fallback**: If ads fail to load, fallback promo should show

### Testing Access Codes

For testing in Expo Go or without real purchases:
1. Go to Settings
2. Scroll to "Access Code (Testing)" section
3. Enter the access code (check `utils/storage.ts` for valid codes)
4. Verify subscriber features are unlocked

## 📱 App Configuration Checklist

Before submitting to app stores:

### app.json Configuration
- [ ] Update `bundleIdentifier` (iOS) and `package` (Android)
- [ ] Add AdMob App IDs
- [ ] Configure app icons and splash screens
- [ ] Set up proper permissions
- [ ] Configure version and build numbers

### Privacy & Legal
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Configure App Tracking Transparency (iOS)
- [ ] Set up GDPR compliance (if applicable)
- [ ] Add subscription terms and auto-renewal disclosure

### Superwall Dashboard
- [ ] Configure paywalls for all placements
- [ ] Test paywall presentation
- [ ] Set up analytics tracking
- [ ] Configure A/B tests (optional)
- [ ] Set up webhooks for events (optional)

### Store Listings
- [ ] Create compelling app description
- [ ] Add screenshots showing features
- [ ] Highlight subscription benefits
- [ ] Add privacy policy and support URL
- [ ] Configure age ratings
- [ ] Set up app categories

## 🐛 Troubleshooting

### "Cannot find native module 'SuperwallExpo'"
- **Cause**: Running in Expo Go
- **Solution**: Build a development build with `expo-dev-client`

### Purchases Not Working
- **Check**: Product IDs match exactly in code, Superwall, and stores
- **Check**: Products are approved in App Store Connect / Google Play
- **Check**: Using development build, not Expo Go
- **Check**: Signed in with sandbox/test account

### Ads Not Showing
- **Check**: Ad Unit IDs are correct
- **Check**: AdMob account is approved (can take 24-48 hours)
- **Check**: User is on Free tier
- **Check**: Not on ad-free screens (support-resources, compose-message)

### Subscription Status Not Syncing
- **Check**: Superwall API key is correct
- **Check**: Products are configured in Superwall dashboard
- **Check**: Placements are created and linked to products
- **Check**: Network connection is available

## 📚 Additional Resources

- **Superwall Docs**: https://superwall.com/docs
- **Expo In-App Purchases**: https://docs.expo.dev/versions/latest/sdk/in-app-purchases/
- **AdMob Setup**: https://developers.google.com/admob/ios/quick-start
- **App Store Connect**: https://developer.apple.com/app-store-connect/
- **Google Play Console**: https://support.google.com/googleplay/android-developer/

## 🎯 Next Steps

1. **Immediate**:
   - [ ] Create Superwall account and get API key
   - [ ] Configure products in Superwall dashboard
   - [ ] Create and design paywalls
   - [ ] Build development build for testing

2. **Before Launch**:
   - [ ] Set up App Store Connect products
   - [ ] Set up Google Play Console products
   - [ ] Create AdMob account and ad units
   - [ ] Test all purchase flows thoroughly
   - [ ] Test on multiple devices
   - [ ] Get beta testers to verify

3. **Post-Launch**:
   - [ ] Monitor Superwall analytics
   - [ ] Track conversion rates
   - [ ] Optimize paywall designs
   - [ ] Monitor ad revenue
   - [ ] Gather user feedback

## 💡 Tips for Success

1. **Paywall Design**: Use Superwall's templates as starting points, then customize
2. **Pricing**: Test different price points with A/B testing
3. **Timing**: Show paywalls at natural moments (e.g., when recording time runs low)
4. **Value Prop**: Clearly communicate the benefits of subscribing
5. **Social Proof**: Add testimonials or user counts if available
6. **Free Trial**: Consider offering a free trial period
7. **Analytics**: Track which paywalls convert best and iterate

## ✅ Configuration Status

Track your progress:

- [ ] Superwall account created
- [ ] Superwall API key added to code
- [ ] Products configured in Superwall
- [ ] Placements created in Superwall
- [ ] Paywalls designed
- [ ] iOS products created in App Store Connect
- [ ] Android products created in Google Play Console
- [ ] AdMob account created
- [ ] Ad units created and IDs added to code
- [ ] Development build created
- [ ] Subscription purchase tested
- [ ] Extra time purchase tested
- [ ] Restore purchases tested
- [ ] Ads tested
- [ ] Ready for production! 🚀

---

**Need Help?**
- Superwall Support: support@superwall.com
- Expo Forums: https://forums.expo.dev
- React Native Community: https://reactnative.dev/community/overview
