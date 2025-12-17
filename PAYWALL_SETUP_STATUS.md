
# Paywall & Ad Configuration Status

## ✅ Fixed Issues

### 1. **React Hooks Rules Violations - FIXED**
- **Problem**: `useSuperwallEvents`, `useUser`, and `usePlacement` hooks were being called conditionally, which violates React's Rules of Hooks
- **Solution**: 
  - Created a separate `SuperwallEventHandler` component in `SubscriptionContext.tsx` that always calls hooks at the top level
  - Created a `SuperwallHooksWrapper` component in `settings.tsx` that ensures hooks are always called unconditionally
  - Hooks are now called at the component level, not inside callbacks or conditional blocks

### 2. **Event Handler Setup - FIXED**
- **Problem**: `useSuperwallEvents` was being called inside a useEffect callback
- **Solution**: Moved to a dedicated component that properly manages event subscriptions and cleanup

### 3. **Code Structure - IMPROVED**
- All Superwall hooks are now properly isolated in wrapper components
- Event handlers are set up at the component level with proper cleanup
- Conditional logic only affects whether Superwall is available, not whether hooks are called

## ⚠️ Outstanding Configuration Tasks

### 1. **Superwall Dashboard Configuration**
**Status**: Needs to be completed in Superwall dashboard

**Steps Required**:
1. Go to https://superwall.com/dashboard
2. Verify your API key matches the one in `constants/BillingConfig.ts`: `pk_8Y5rQaGpH1IBbI1u08gVd`
3. Create two placements:
   - **Placement ID**: `subscription_purchase`
     - **Purpose**: Monthly subscription paywall
     - **Product**: Link to your App Store/Play Store subscription product
   - **Placement ID**: `extra_time_purchase`
     - **Purpose**: Extra recording time purchase
     - **Product**: Link to your App Store/Play Store consumable product
4. Design your paywalls in the Superwall dashboard
5. Configure paywall triggers and rules

### 2. **App Store Connect Configuration**
**Status**: Needs to be completed

**Steps Required**:
1. Go to https://appstoreconnect.apple.com
2. Navigate to your app
3. Go to "In-App Purchases" section
4. Create two products:
   - **Auto-Renewable Subscription**:
     - Product ID: `com.sayitanyway.subscription.monthly`
     - Price: $2.50/month
     - Display Name: "Subscriber"
     - Description: "60 minutes of Recording Time per month, no ads"
   - **Consumable**:
     - Product ID: `com.sayitanyway.extratime`
     - Price: $2.00
     - Display Name: "Extra Recording Time"
     - Description: "60 minutes of extra recording time (rolls over)"
5. Submit products for review
6. Link these product IDs in your Superwall dashboard

### 3. **Google Play Console Configuration**
**Status**: Needs to be completed

**Steps Required**:
1. Go to https://play.google.com/console
2. Navigate to your app
3. Go to "Monetize" → "Products" → "In-app products"
4. Create two products matching the iOS products:
   - **Subscription**:
     - Product ID: `com.sayitanyway.subscription.monthly`
     - Price: $2.50/month
   - **Consumable**:
     - Product ID: `com.sayitanyway.extratime`
     - Price: $2.00
5. Activate the products
6. Link these product IDs in your Superwall dashboard

### 4. **AdMob Configuration**
**Status**: Using test ad unit IDs - needs production IDs

**Current Test IDs** (in `constants/BillingConfig.ts`):
- iOS: `ca-app-pub-3940256099942544/2934735716`
- Android: `ca-app-pub-3940256099942544/6300978111`

**Steps Required**:
1. Go to https://apps.admob.com/
2. Create or select your app
3. Create banner ad units for both iOS and Android
4. Replace the test IDs in `constants/BillingConfig.ts` with your production ad unit IDs
5. Update `app.json` with your real AdMob app IDs:
   - Current iOS: `ca-app-pub-3940256099942544~1458002511`
   - Current Android: `ca-app-pub-3940256099942544~3347511713`

### 5. **Bundle Identifier Configuration**
**Status**: Using placeholder - needs to be updated

**Current Bundle IDs** (in `app.json`):
- iOS: `com.anonymous.Natively`
- Android: `com.anonymous.Natively`

**Steps Required**:
1. Choose your final bundle identifier (e.g., `com.yourcompany.sayitanyway`)
2. Update in `app.json`:
   ```json
   "ios": {
     "bundleIdentifier": "com.yourcompany.sayitanyway"
   },
   "android": {
     "package": "com.yourcompany.sayitanyway"
   }
   ```
3. Update product IDs in `constants/BillingConfig.ts` to match:
   - `com.yourcompany.sayitanyway.subscription.monthly`
   - `com.yourcompany.sayitanyway.extratime`

## 🧪 Testing Checklist

### In Expo Go / Web (Limited Testing)
- ✅ Access code unlock works
- ✅ Theme selection works
- ✅ Recording time display works
- ✅ Fallback ad banners show for free users
- ⚠️ Real purchases cannot be tested (expected)

### In Development Build (Full Testing)
**Prerequisites**: Build with `expo-dev-client`

**Test Cases**:
1. **Subscription Flow**:
   - [ ] Tap "Subscribe" button in Settings
   - [ ] Superwall paywall appears
   - [ ] Complete purchase flow
   - [ ] Verify subscription activates
   - [ ] Verify ads disappear
   - [ ] Verify recording time increases to 60 minutes

2. **Extra Time Purchase**:
   - [ ] Subscribe first (or use access code)
   - [ ] Tap "Buy Extra Time" button
   - [ ] Complete purchase flow
   - [ ] Verify extra time is added to purchased pool
   - [ ] Verify extra time persists across app restarts

3. **Restore Purchases**:
   - [ ] Make a purchase
   - [ ] Uninstall and reinstall app
   - [ ] Tap "Restore Purchases"
   - [ ] Verify subscription and extra time are restored

4. **Ad Display**:
   - [ ] As free user, verify ads show on Home screen
   - [ ] As free user, verify ads show on Message List screen
   - [ ] As free user, verify ads DON'T show on Support Resources
   - [ ] As subscriber, verify ads don't show anywhere
   - [ ] Verify ad fallback message shows if ad fails to load

5. **Recording Time**:
   - [ ] Verify free users get 5 minutes (300 seconds) monthly
   - [ ] Verify subscribers get 60 minutes (3600 seconds) monthly
   - [ ] Verify purchased extra time rolls over
   - [ ] Verify monthly pools reset on 1st of month
   - [ ] Verify warning shows when under 5 minutes remaining

## 📝 Configuration Files Reference

### `constants/BillingConfig.ts`
Contains all billing and ad configuration:
- Product IDs for iOS and Android
- Superwall placement IDs
- AdMob ad unit IDs
- Superwall API key

### `app.json`
Contains app-level configuration:
- Bundle identifiers
- AdMob app IDs
- Permissions
- Plugins

### `contexts/SubscriptionContext.tsx`
Manages subscription state and Superwall event handling:
- Subscription tier tracking
- Ad visibility logic
- Superwall event listeners

### `app/settings.tsx`
User-facing subscription management:
- Subscribe button
- Buy extra time button
- Restore purchases button
- Access code unlock (for testing)

## 🚀 Next Steps

1. **Immediate** (Can do now):
   - ✅ Code fixes are complete
   - Test in Expo Go with access codes
   - Verify UI and flows work correctly

2. **Before Production** (Required):
   - Complete Superwall dashboard setup
   - Create App Store Connect products
   - Create Google Play Console products
   - Replace test AdMob IDs with production IDs
   - Update bundle identifiers
   - Build development build for testing
   - Complete full testing checklist

3. **Production Launch**:
   - Submit in-app products for review
   - Wait for approval
   - Test with TestFlight/Internal Testing
   - Launch to production

## 💡 Tips

- **Testing in Expo Go**: Use the access code feature to test subscriber features without real purchases
- **Development Builds**: Required for testing real in-app purchases and ads
- **Superwall Dashboard**: Design your paywalls carefully - they're what users will see when subscribing
- **Product IDs**: Must match exactly between your code, App Store Connect, Google Play Console, and Superwall
- **Ad Testing**: Test ads show correctly for free users and hide for subscribers

## 🆘 Troubleshooting

### "Cannot find native module 'SuperwallExpo'"
- **Cause**: Running in Expo Go
- **Solution**: Build a development build with `expo-dev-client`

### Paywall doesn't show
- **Check**: Superwall API key is correct
- **Check**: Placement IDs match between code and dashboard
- **Check**: Products are configured in Superwall dashboard
- **Check**: Running in development build (not Expo Go)

### Ads don't show
- **Check**: User is on Free tier
- **Check**: Screen is not in AD_FREE_SCREENS list
- **Check**: AdMob is properly configured
- **Check**: Running on native platform (not web)

### Subscription doesn't activate after purchase
- **Check**: Product IDs match exactly
- **Check**: Superwall event handlers are set up
- **Check**: billingService.activateSubscription() is being called
- **Check**: Console logs for errors

## 📚 Documentation Links

- [Superwall Documentation](https://superwall.com/docs/home)
- [Expo Superwall SDK](https://github.com/superwall/expo-superwall)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [AdMob](https://apps.admob.com/)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
