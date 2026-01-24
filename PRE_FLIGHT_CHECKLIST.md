
# Pre-Flight Checklist - Version 1.1.0 Deployment

Complete this checklist before submitting to the App Store.

## ✅ Configuration Verification

- [x] **Version Number**: Updated to 1.1.0 in app.json
- [x] **iOS Build Number**: Incremented to 2 in app.json
- [x] **Android Version Code**: Incremented to 2 in app.json
- [x] **Bundle Identifier**: Correct (com.chumphrey.sayitanywaygj)
- [x] **Slug**: Fixed (no spaces) - say-it-anyway-grief-journal
- [x] **Package Name**: Updated to match slug
- [ ] **EAS Project ID**: Update in app.json (replace "your-project-id-here")

## ✅ EAS Configuration

- [x] **eas.json**: Production profile configured
- [ ] **Apple ID**: Update in eas.json submit section
- [ ] **ASC App ID**: Update in eas.json submit section
- [ ] **Apple Team ID**: Update in eas.json submit section

## ✅ Permissions & Privacy

- [x] **Microphone Permission**: Declared for audio recording
- [x] **Photo Library Permission**: Declared for backgrounds and profiles
- [x] **Camera Permission**: Declared for backgrounds and profiles
- [x] **Export Compliance**: ITSAppUsesNonExemptEncryption set to false
- [x] **Privacy Policy**: Available (privacy-policy.md)

## ✅ Features to Test

### Core Features (Existing)
- [ ] Create recipient with photo
- [ ] Record audio message
- [ ] Play audio message
- [ ] Create text message
- [ ] Hide/unhide messages
- [ ] Delete recipient
- [ ] Mental health screening triggers correctly
- [ ] SOS button shows support resources

### New Features (v1.1.0)
- [ ] Location detection sets default region
- [ ] Region selector in Settings works
- [ ] Support resources change based on region
- [ ] Background scene selection works
- [ ] Custom photo background upload works
- [ ] Transparency slider adjusts background
- [ ] Help modal displays correctly
- [ ] Theme changes persist after restart
- [ ] Data migration from v1.0.0 works (if testing upgrade)

### Platform-Specific
- [ ] iOS: Native tabs display correctly
- [ ] iOS: SF Symbols icons render
- [ ] iOS: Back navigation works
- [ ] iOS: Status bar styling correct
- [ ] Test on iPhone (various sizes)
- [ ] Test on iPad

## ✅ Data & Storage

- [x] **Storage System**: AsyncStorage implemented
- [ ] **Data Persistence**: Recipients save and load
- [ ] **Data Persistence**: Messages save and load
- [ ] **Data Persistence**: Audio files save and play
- [ ] **Data Persistence**: Theme settings persist
- [ ] **Data Persistence**: Background settings persist
- [ ] **Data Persistence**: Region selection persists
- [ ] **Migration**: v1.0.0 data migrates to v1.1.0 correctly

## ✅ UI/UX

- [ ] **Navigation**: All screens accessible
- [ ] **Back Buttons**: Work on all screens
- [ ] **Tab Bar**: Displays correctly on home screen
- [ ] **Animations**: Smooth and performant
- [ ] **Loading States**: Show during async operations
- [ ] **Error Handling**: Graceful error messages
- [ ] **Dark Mode**: All screens support dark mode
- [ ] **Light Mode**: All screens support light mode
- [ ] **Accessibility**: VoiceOver compatible (iOS)
- [ ] **Touch Targets**: All buttons easily tappable

## ✅ Support Resources

Test these regions (sample):
- [ ] **United States**: 988 hotline displays
- [ ] **United Kingdom**: Samaritans displays
- [ ] **Canada**: Crisis Services Canada displays
- [ ] **Australia**: Lifeline displays
- [ ] **Phone Links**: Open phone app correctly
- [ ] **Text Links**: Open messages app correctly
- [ ] **Web Links**: Open browser correctly

## ✅ Mental Health Screening

Test these scenarios:
- [ ] **Positive Detection**: "I want to hurt myself" triggers
- [ ] **Positive Detection**: "I can't go on" triggers
- [ ] **Positive Detection**: "I want to end it all" triggers
- [ ] **Negative Detection**: "They hurt themselves" doesn't trigger
- [ ] **Negative Detection**: "She was in pain" doesn't trigger
- [ ] **Support Screen**: Shows after flagged message
- [ ] **Support Screen**: Shows correct region resources

## ✅ Audio Recording

- [ ] **Permission Request**: Prompts for microphone access
- [ ] **Recording**: Starts and stops correctly
- [ ] **Timer**: Shows recording duration
- [ ] **Playback**: Audio plays correctly
- [ ] **Transcription**: Speech-to-text works
- [ ] **Storage**: Audio files persist after app restart
- [ ] **Compression**: Audio files are compressed

## ✅ Image Handling

- [ ] **Photo Library**: Opens picker correctly
- [ ] **Camera**: Opens camera correctly
- [ ] **Permission Request**: Prompts for photo/camera access
- [ ] **Image Display**: Photos display in recipient cards
- [ ] **Image Display**: Background images display
- [ ] **Image Persistence**: Images persist after restart
- [ ] **Custom Background**: User photo sets as background

## ✅ Performance

- [ ] **App Launch**: Opens quickly (< 3 seconds)
- [ ] **Navigation**: Transitions are smooth
- [ ] **Scrolling**: Lists scroll smoothly
- [ ] **Memory**: No memory leaks during extended use
- [ ] **Audio Playback**: No lag or stuttering
- [ ] **Image Loading**: Images load without delay
- [ ] **Storage**: No storage errors with large datasets

## ✅ Edge Cases

- [ ] **No Recipients**: Empty state displays correctly
- [ ] **No Messages**: Empty state displays correctly
- [ ] **Long Names**: Truncate properly
- [ ] **Long Messages**: Display and scroll correctly
- [ ] **Many Recipients**: Performance remains good (test 20+)
- [ ] **Many Messages**: Performance remains good (test 100+)
- [ ] **Large Audio Files**: Handle without crashing
- [ ] **Network Offline**: App works (offline-first)
- [ ] **Low Storage**: Graceful error handling

## ✅ Localization

- [ ] **Region Detection**: Detects device locale correctly
- [ ] **Default Region**: Sets appropriate default
- [ ] **Region List**: All 28+ regions display
- [ ] **Region Names**: Display correctly
- [ ] **Support Resources**: Correct for each region

## ✅ Documentation

- [x] **CHANGELOG.md**: Updated with v1.1.0 changes
- [x] **DEPLOYMENT.md**: Deployment guide created
- [x] **PRE_FLIGHT_CHECKLIST.md**: This checklist
- [x] **README.md**: Up to date
- [x] **privacy-policy.md**: Available

## ✅ App Store Preparation

- [ ] **Screenshots**: Prepared for all required sizes
- [ ] **App Preview Video**: Optional but recommended
- [ ] **App Description**: Updated with new features
- [ ] **Keywords**: Optimized for App Store search
- [ ] **What's New**: Release notes prepared (see DEPLOYMENT.md)
- [ ] **Support URL**: Valid and accessible
- [ ] **Privacy Policy URL**: Valid and accessible
- [ ] **Age Rating**: Appropriate (likely 12+ due to mental health content)

## ✅ Legal & Compliance

- [x] **Privacy Policy**: No data collection stated
- [x] **Export Compliance**: Declared in app.json
- [ ] **Content Rights**: All images/content properly licensed
- [ ] **Third-Party Libraries**: All licenses compatible
- [ ] **Mental Health Disclaimers**: Appropriate language used

## ✅ Final Checks

- [ ] **Clean Build**: No warnings or errors
- [ ] **Console Logs**: No error logs during testing
- [ ] **Crash Reports**: No crashes during testing
- [ ] **TestFlight**: Tested by at least 2 people
- [ ] **Upgrade Path**: Tested upgrade from v1.0.0
- [ ] **Fresh Install**: Tested fresh install of v1.1.0

## 🚀 Ready to Deploy

Once all items are checked:

1. Run: `eas build --platform ios --profile production`
2. Wait for build to complete
3. Run: `eas submit --platform ios --profile production`
4. Monitor App Store Connect for review status
5. Test via TestFlight before releasing to production

## 📝 Notes

- This is an **upgrade** to existing App Store listing
- Users will receive automatic update
- No breaking changes for existing users
- Data migration is automatic and transparent

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Build ID**: _____________

**Submission ID**: _____________

**App Store Status**: _____________
