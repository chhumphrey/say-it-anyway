
// Billing and Ad Configuration
// Replace TEST IDs with real IDs when ready for production

export const BillingConfig = {
  // In-App Purchase Product IDs
  // These should match the product IDs you configure in App Store Connect and Google Play Console
  products: {
    subscription: {
      ios: 'com.sayitanyway.subscription.monthly',
      android: 'com.sayitanyway.subscription.monthly',
      price: 2.50,
      displayName: 'Subscriber',
      description: '60 minutes of Recording Time per month, no ads',
    },
    extraTime: {
      ios: 'com.sayitanyway.extratime',
      android: 'com.sayitanyway.extratime',
      price: 2.00,
      displayName: 'Extra Recording Time',
      description: '60 minutes of extra recording time (rolls over)',
    },
  },

  // Superwall Placement IDs
  // These should match the placement names you configure in your Superwall dashboard
  placements: {
    subscription: 'subscription_purchase',
    extraTime: 'extra_time_purchase',
  },

  // AdMob Ad Unit IDs
  // ⚠️ IMPORTANT: These are TEST IDs - replace with real IDs from AdMob console before production
  adUnits: {
    banner: {
      // Test ad unit IDs from Google (safe to use during development)
      ios: 'ca-app-pub-3940256099942544/2934735716',
      android: 'ca-app-pub-3940256099942544/6300978111',
      
      // 📝 TO DO: Replace with your production Ad Unit IDs:
      // 1. Go to https://apps.admob.com/
      // 2. Create an app (if not already created)
      // 3. Create banner ad units for iOS and Android
      // 4. Replace the test IDs above with your production IDs
      // 
      // Production format:
      // ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
      // android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    },
  },

  // Superwall Configuration
  // ⚠️ IMPORTANT: Replace with your actual Superwall API key from your dashboard
  superwall: {
    // Get your API key from: https://superwall.com/dashboard
    apiKey: 'pk_8Y5rQaGpH1IBbI1u08gVd',
    
    // 📝 TO DO: Configure Superwall Dashboard
    // 1. Go to https://superwall.com/dashboard
    // 2. Create placements matching the IDs above:
    //    - 'subscription_purchase' for monthly subscription
    //    - 'extra_time_purchase' for extra recording time
    // 3. Design your paywalls in the Superwall dashboard
    // 4. Link the placements to your App Store/Play Store products
    // 5. Set up your product IDs to match the ones above
  },
};

// Configuration checklist for production:
// 
// ✅ SUPERWALL SETUP:
//    □ Create account at https://superwall.com
//    □ Add your app to Superwall dashboard
//    □ Configure products matching the IDs above
//    □ Create placements: 'subscription_purchase' and 'extra_time_purchase'
//    □ Design paywalls for each placement
//    □ Test paywalls in development build
//
// ✅ APP STORE / GOOGLE PLAY SETUP:
//    □ Create in-app purchase products in App Store Connect
//    □ Create in-app purchase products in Google Play Console
//    □ Ensure product IDs match exactly: 'com.sayitanyway.subscription.monthly' and 'com.sayitanyway.extratime'
//    □ Set up pricing ($2.50/month for subscription, $2.00 for extra time)
//    □ Submit products for review
//
// ✅ ADMOB SETUP:
//    □ Create AdMob account at https://apps.admob.com/
//    □ Add your app to AdMob
//    □ Create banner ad units for iOS and Android
//    □ Replace test ad unit IDs above with production IDs
//    □ Link AdMob to your app in app.json
//
// ✅ TESTING:
//    □ Build development build with expo-dev-client
//    □ Test subscription purchase flow
//    □ Test extra time purchase flow
//    □ Test restore purchases
//    □ Test ad display for free users
//    □ Test ad removal for subscribers
//    □ Verify recording time pools work correctly
