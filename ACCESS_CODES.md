
# Access Codes for Testing

## What are Access Codes?

Access codes allow you to unlock subscriber features without making real in-app purchases. This is useful for:

- Testing subscriber features in Expo Go (where real purchases don't work)
- Testing subscriber features in development builds without spending money
- Giving beta testers access to premium features
- Developer testing and debugging

## How to Use Access Codes

1. Open the app
2. Navigate to **Settings** (tap the gear icon)
3. Scroll down to the **"Access Code (Testing)"** or **"Developer/Test Access Code"** section
4. Tap **"Enter Access Code"**
5. Enter one of the valid access codes below
6. Tap **"Unlock"**

## Valid Access Codes

The access code validation is in `utils/storage.ts`. Currently, the following codes are valid:

- `TESTCODE123` - Basic test code
- `DEVELOPER` - Developer access
- `BETA2024` - Beta tester access

**Note**: These are example codes. Check `utils/storage.ts` for the actual validation logic and add your own codes as needed.

## What Access Codes Unlock

When you use an access code, you get:

✅ **Subscription Tier**: Changes from "Free" to "Subscriber (Unlocked)"

✅ **Recording Time**: 60 minutes (3600 seconds) per month in the subscriber pool

✅ **No Ads**: Ads are hidden throughout the app

✅ **All Subscriber Features**: Full access to everything a paying subscriber would get

## Deactivating an Access Code

To return to the Free tier:

1. Go to **Settings**
2. In the **"Access Code"** section, tap **"Deactivate Unlock"**
3. Confirm the action

This will:
- Return you to the Free tier
- Reset recording time to 5 minutes per month
- Show ads again

## Access Code vs Real Subscription

| Feature | Access Code | Real Subscription |
|---------|-------------|-------------------|
| Works in Expo Go | ✅ Yes | ❌ No |
| Works in Dev Build | ✅ Yes | ✅ Yes |
| Works in Production | ✅ Yes | ✅ Yes |
| Syncs across devices | ❌ No | ✅ Yes |
| Auto-renews | ❌ No | ✅ Yes |
| Supports app revenue | ❌ No | ✅ Yes |
| Can be restored | ❌ No | ✅ Yes |

## Adding Custom Access Codes

To add your own access codes, edit `utils/storage.ts`:

```typescript
export const validateAccessCode = (code: string): boolean => {
  const validCodes = [
    'TESTCODE123',
    'DEVELOPER',
    'BETA2024',
    'YOUR_CUSTOM_CODE', // Add your code here
  ];
  
  return validCodes.includes(code.toUpperCase());
};
```

## Security Considerations

⚠️ **Important**: Access codes are stored locally and are NOT secure. They should only be used for:

- Development and testing
- Beta testing programs
- Temporary promotional access

For production apps:
- Don't share access codes publicly
- Consider removing or disabling access codes in production builds
- Use Superwall's promotional offers for real promotions
- Use TestFlight for beta testing with real purchases

## Testing Workflow

### In Expo Go (No Real Purchases)
1. Use access code to unlock features
2. Test all subscriber functionality
3. Test ad hiding
4. Test recording time pools
5. Deactivate and test free tier

### In Development Build (With Real Purchases)
1. Test real subscription purchase flow
2. Test extra time purchase flow
3. Test restore purchases
4. Use access code as fallback for testing
5. Verify access code doesn't interfere with real purchases

## Troubleshooting

### "Invalid Access Code"
- Check spelling and capitalization (codes are case-insensitive)
- Verify the code exists in `utils/storage.ts`
- Check console logs for validation errors

### Access Code Doesn't Unlock Features
- Check that subscription tier shows "Subscriber (Unlocked)"
- Verify recording time increased to 60 minutes
- Check that ads are hidden
- Look for errors in console logs

### Can't Deactivate Access Code
- Try restarting the app
- Check console logs for errors
- Verify you're in the correct section of Settings

### Access Code Persists After Uninstall
- Access codes are stored in AsyncStorage
- Uninstalling the app should clear them
- If not, manually clear app data in device settings

## For Beta Testers

If you're a beta tester and received an access code:

1. Install the app via TestFlight (iOS) or Internal Testing (Android)
2. Open the app and complete onboarding
3. Go to Settings
4. Enter the access code you received
5. Enjoy full subscriber features!
6. Report any issues you find

**Note**: Your access code is for testing only and may be deactivated at any time.

## For Developers

### Checking Access Code Status

```typescript
import { StorageService } from '@/utils/storage';

const status = await StorageService.getSubscriptionStatus();
console.log('Is Unlocked:', status.isUnlocked);
console.log('Tier:', status.tier);
```

### Programmatically Unlocking

```typescript
import { StorageService } from '@/utils/storage';

await StorageService.unlockSubscription();
```

### Programmatically Deactivating

```typescript
import { StorageService } from '@/utils/storage';

await StorageService.deactivateSubscriptionUnlock();
```

## Production Considerations

Before launching to production, consider:

1. **Remove or Disable**: Remove access code feature entirely, or hide it behind a debug flag
2. **Obfuscate**: Make the access code section harder to find (e.g., require 10 taps on app version)
3. **Server Validation**: Move validation to a server to prevent code extraction
4. **Time Limits**: Add expiration dates to access codes
5. **Usage Tracking**: Track which codes are used and by whom

## Questions?

If you have questions about access codes:
- Check the code in `utils/storage.ts`
- Review the Settings screen implementation in `app/settings.tsx`
- Check the SubscriptionContext in `contexts/SubscriptionContext.tsx`
- Look at the PAYWALL_SETUP_STATUS.md for overall configuration
