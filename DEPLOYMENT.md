
# Deployment Guide - Say It Anyway: Grief Journal

This guide covers deploying version 1.1.0 as an upgrade to the existing Apple App Store deployment using Expo Launch.

## Pre-Deployment Checklist

### 1. Version Information
- **App Version**: 1.1.0 (upgraded from 1.0.0)
- **iOS Build Number**: 2 (upgraded from 1)
- **Android Version Code**: 2 (upgraded from 1)
- **Bundle Identifier**: com.chumphrey.sayitanywaygj

### 2. Configuration Files Updated
- ✅ `app.json` - Version and build numbers incremented
- ✅ `package.json` - Version updated to 1.1.0
- ✅ `eas.json` - Production build configuration ready
- ✅ `CHANGELOG.md` - Version 1.1.0 documented

### 3. Key Changes in This Version
- Location-based support resources (28+ countries)
- Background customization with custom photos
- Enhanced theme system
- Help modal system
- Storage migration to AsyncStorage
- Removed Profile feature (single-user app)

## Deployment Steps

### Step 1: Configure EAS Project

If you haven't already, you need to set up your EAS project ID:

```bash
# Login to Expo
eas login

# Configure the project (if not already done)
eas build:configure
```

Update the `projectId` in `app.json` under `extra.eas.projectId` with your actual EAS project ID.

### Step 2: Update EAS Submit Configuration

Edit `eas.json` and update the submit section with your Apple credentials:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@example.com",
      "ascAppId": "your-app-store-connect-app-id",
      "appleTeamId": "your-apple-team-id"
    }
  }
}
```

You can find these values:
- **Apple ID**: Your Apple Developer account email
- **ASC App ID**: Found in App Store Connect under App Information
- **Apple Team ID**: Found in Apple Developer account settings

### Step 3: Build for Production

Build the iOS app for production:

```bash
# Build for iOS App Store
eas build --platform ios --profile production
```

This will:
- Automatically increment the build number (currently set to 2)
- Create a production-ready build
- Upload to EAS servers

Wait for the build to complete. You'll receive a URL to download the build.

### Step 4: Submit to App Store

Once the build is complete, submit to the App Store:

```bash
# Submit to App Store
eas submit --platform ios --profile production
```

Or use the Expo Launch dashboard to submit directly.

### Step 5: App Store Connect Configuration

After submission, log into App Store Connect and:

1. **Version Information**
   - Confirm version is 1.1.0
   - Build number should be 2

2. **What's New in This Version** (copy this for App Store):
   ```
   Version 1.1.0 brings powerful new features to help you on your grief journey:

   • Location-Based Support: Access crisis resources tailored to your region with support for 28+ countries worldwide
   • Custom Backgrounds: Personalize your experience with beautiful scenes or your own photos
   • Enhanced Themes: Create custom color palettes that bring you comfort
   • Help System: New in-app help to guide you through features
   • Improved Performance: Better storage handling for your messages and audio recordings

   As always, your data stays private and secure on your device.
   ```

3. **App Privacy**
   - Confirm: No data collection
   - All data stored locally on device
   - No third-party tracking

4. **Export Compliance**
   - Set `ITSAppUsesNonExemptEncryption` to `false` (already in app.json)
   - No encryption beyond standard iOS encryption

5. **Screenshots & Metadata**
   - Update screenshots if UI has changed significantly
   - Ensure all metadata is current

### Step 6: TestFlight (Optional but Recommended)

Before releasing to production, test via TestFlight:

1. The build will automatically appear in TestFlight
2. Add internal testers
3. Test all new features:
   - Location-based support resources
   - Background customization
   - Theme changes
   - Help modal
   - Verify data migration from v1.0.0

### Step 7: Release

Once testing is complete:

1. In App Store Connect, select the build
2. Choose "Release this version"
3. Select release option:
   - **Automatic**: Releases immediately after approval
   - **Manual**: You control when to release after approval

## Post-Deployment

### Monitor

1. **Crash Reports**: Check Expo dashboard and App Store Connect for crashes
2. **User Reviews**: Monitor for feedback on new features
3. **Analytics**: Track adoption of new features (if analytics added)

### Support

Ensure support resources are working correctly:
- Test crisis hotline links for multiple regions
- Verify phone/text/web links open correctly
- Confirm region detection works properly

## Rollback Plan

If critical issues are discovered:

1. **Quick Fix**: 
   - Fix the issue
   - Increment build number to 3
   - Submit new build as 1.1.1

2. **Major Issues**:
   - Can't rollback in App Store
   - Must submit new version with fixes
   - Consider expedited review if critical

## Technical Notes

### Storage Migration

Users upgrading from 1.0.0 will automatically migrate from SecureStore to AsyncStorage. The app handles this transparently:

- Existing data is preserved
- No user action required
- Migration happens on first launch of 1.1.0

### Permissions

New permissions in this version:
- Photo library access (for custom backgrounds)
- Camera access (for custom backgrounds)

These are already declared in `app.json` and will prompt users on first use.

### Compatibility

- **Minimum iOS Version**: iOS 13.4+ (Expo 54 requirement)
- **Device Support**: iPhone and iPad
- **Orientation**: Portrait only

## Troubleshooting

### Build Fails

```bash
# Clear cache and retry
eas build --platform ios --profile production --clear-cache
```

### Submit Fails

- Verify Apple credentials in eas.json
- Check App Store Connect for existing builds
- Ensure bundle identifier matches

### Version Conflicts

If App Store rejects due to version:
- Increment version in app.json
- Rebuild and resubmit

## Commands Reference

```bash
# Login to EAS
eas login

# Check build status
eas build:list

# View build details
eas build:view [build-id]

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Check submission status
eas submit:list
```

## Support & Resources

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com

## Notes

- This is an **upgrade** to an existing App Store listing
- Bundle identifier remains the same: `com.chumphrey.sayitanywaygj`
- Users will receive this as an automatic update
- All existing user data will be preserved and migrated
- No breaking changes for existing users

---

**Ready to Deploy**: All configuration files are updated and ready for deployment via Expo Launch.
