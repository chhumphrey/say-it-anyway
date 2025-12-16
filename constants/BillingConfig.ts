
// Billing and Ad Configuration
// Replace TEST IDs with real IDs when ready for production

export const BillingConfig = {
  // In-App Purchase Product IDs
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

  // AdMob Ad Unit IDs
  // These are TEST IDs - replace with real IDs from AdMob console
  adUnits: {
    banner: {
      // Test ad unit IDs from Google
      ios: 'ca-app-pub-3940256099942544/2934735716',
      android: 'ca-app-pub-3940256099942544/6300978111',
      // Production IDs (replace these when ready):
      // ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
      // android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    },
  },

  // Superwall Configuration
  superwall: {
    // Replace with your Superwall API key
    apiKey: 'YOUR_SUPERWALL_API_KEY',
  },
};
