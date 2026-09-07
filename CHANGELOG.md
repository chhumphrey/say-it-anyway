
# Changelog

All notable changes to the Say It Anyway: Grief Journal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-07

### Added
- **Hybrid Self-Harm Screening** — added an on-device statistical classifier alongside the
  existing rule-based screening to catch phrasing the regex patterns miss, plus new detection
  for self-injury language (previously uncovered). See `SELF_HARM_SCREENING.md` for full
  design, data sources, and testing details.
- **Backup & Restore**
  - Create a full backup of recipients, messages, audio recordings, and settings as a shareable ZIP archive
  - Share the backup via the native share sheet (iOS/Android) or download it directly (web)
  - Restore from a previously created backup file, with duplicate-safe import — anything already on the device (matched by ID) is skipped rather than duplicated
  - Audio files are re-linked to new device-local paths on restore; a failed audio restore is reported in the result summary without blocking the rest of the import
  - Theme and device preferences are intentionally excluded from restore so the current device's settings are preserved
  - New "Backup & Restore" screen, accessible from Settings > Data Management

### Changed
- **Compatibility**
  - Updated to Expo SDK 57 (from SDK 54), including React Native, React, and all Expo module dependencies
  - Migrated off the legacy `expo-file-system` API (which now throws instead of warning) to the new `File`/`Directory`/`Paths` class-based API
  - Synced `app.json`'s plugin list and added a Metro resolver workaround for compatibility with the updated `expo-router`
  - Refactored several components from React Navigation's theme hook to the app's own theme context, matching the rest of the app
  - Removed deprecated global `expo-cli` usage; all scripts now use `npx expo`
  - Removed leftover references to the "Natively" platform (unused server log-forwarding code, manifest fields)

### Fixed
- **Data loss on recipient deletion** — deleting a recipient removed the recipient record but left all of their messages in storage due to a bug that appended instead of overwriting; messages are now correctly removed along with the recipient
- **Backup restore failing to read the selected file** — worked around a permission-check bug in the new `expo-file-system` API that could reject reading a backup file copied into the cache directory by the document picker

### Technical Improvements
- Upgraded `@typescript-eslint` from v6 to v8
- Added `fflate`, `expo-sharing`, and `expo-document-picker` dependencies to support backup/restore

## [1.1.0] - 2026-01-24

### Added
- **Location-Based Support Resources**
  - Regional support resource customization based on user location
  - Device locale detection for automatic default region selection
  - Support for 28+ countries/regions worldwide
  - Region selector in Settings screen
  - Localized crisis hotlines, text lines, and emergency contacts
  - Dynamic support resources display based on selected region

- **Background Customization**
  - Scene selection (Ocean, Forest, Mountains, Moody Sky, Dawn, Dusk)
  - Custom photo upload for backgrounds
  - Transparency slider for background opacity control
  - Dynamic background generation based on color palette
  - Local photo picker integration with camera and library access

- **Enhanced Theme System**
  - Custom color palette creation
  - Improved theme persistence
  - Better visual consistency across screens

- **Help System**
  - In-app help modal with comprehensive feature explanations
  - Context-sensitive help content
  - Easy access from main navigation

### Changed
- **Storage System**
  - Migrated from SecureStore to AsyncStorage to overcome size limitations
  - Improved data handling for larger recipient and message collections
  - Better performance for audio file storage

- **User Interface**
  - Refined navigation structure
  - Improved accessibility and contrast
  - Enhanced visual feedback for user actions
  - Better platform-specific adaptations (iOS/Android)

### Removed
- **Profile Feature**
  - Removed Profile section (single-user app doesn't require profiles)
  - Removed Profile navigation option from tab bar
  - Removed Profile references from help documentation
  - Removed redundant Home button from home screen

### Fixed
- Unique key warnings in list rendering (now using UUIDs)
- Storage size limitations with large audio files
- Theme persistence across app restarts
- Background image transparency handling

### Technical Improvements
- Updated to Expo SDK 54
- Improved TypeScript type safety
- Enhanced error handling and logging
- Better memory management for audio files
- Optimized image loading and caching

## [1.0.0] - 2026-01-15

### Added
- **Core Journaling Features**
  - Private, offline-first grief journaling application
  - Recipient management system with contact-style cards
  - Support for multiple recipients with customizable profiles
  - Text and audio message creation capabilities
  - Message history tracking with timestamps
  - Message hiding functionality (non-destructive)
  - Default recipient selection

- **Recipient Profiles**
  - Name and nickname fields
  - Optional gender selection (Male, Female, Non-Binary, Decline to State)
  - Photo upload support
  - Date of birth and date of death tracking
  - Personal notes section
  - Last message timestamp display

- **Audio Recording**
  - Local audio recording with compression
  - Voicemail-quality audio storage
  - Speech-to-text transcription (on-device)
  - Audio playback with duration display
  - Recording controls with visual feedback

- **Mental Health Support**
  - Context-aware mental health screening
  - Rule-based pattern analysis for distress detection
  - First-person expression identification
  - Automatic support resources display when flagged
  - Emergency "!!!" button for immediate access to resources

- **Theme System**
  - 6-8 calming color themes
  - Light and dark mode support
  - Theme persistence across sessions
  - Visually pleasing, accessible design

- **User Interface**
  - Mobile-first, one-hand friendly design
  - Calm, empathetic language throughout
  - Accessible design patterns
  - Smooth animations and transitions
  - Native iOS and Android support
  - Platform-specific optimizations

- **Data Management**
  - Local storage using SecureStore (later migrated to AsyncStorage)
  - Offline-first architecture
  - No cloud backend required
  - Secure data persistence
  - UUID-based unique identifiers

### Technical Details

#### Architecture
- React Native with Expo 54
- Expo Router for file-based navigation
- TypeScript for type safety
- Context API for theme management
- Atomic JSX structure for visual editor compatibility

#### Key Dependencies
- `expo-audio` - Audio recording and playback
- `expo-image-picker` - Photo selection
- `@react-native-async-storage/async-storage` - Data persistence
- `@react-native-community/slider` - Transparency controls
- `expo-localization` - Device locale detection
- `expo-file-system` - File management
- `react-native-reanimated` - Smooth animations

#### Storage Structure
- Recipients stored with full profile data
- Messages linked to recipients by ID
- Audio files stored locally with compression
- Theme preferences persisted
- Background settings saved
- Regional preferences stored

#### Mental Health Screening
- Pattern-based analysis (not simple keyword matching)
- Context-aware distress detection
- First-person expression identification
- Avoids false positives for third-person descriptions
- Designed for future NLP upgrades

### Security & Privacy
- All data stored locally on device
- No cloud synchronization
- No external data transmission
- No user accounts or authentication required
- Complete privacy for sensitive grief journaling

### Accessibility
- High contrast color themes
- Readable font sizes
- Touch-friendly interface elements
- Screen reader compatible
- One-hand operation support

### Platform Support
- iOS (native)
- Android (native)
- Optimized for mobile devices
- Platform-specific UI adaptations

## Future Considerations

### Potential Enhancements
- Advanced NLP for mental health screening
- Additional language support
- More regional support resources
- Reminder notifications
- Memorial date tracking
- Photo galleries for recipients
- iCloud/Google Drive backup options
- Widget support for quick access
- Apple Watch companion app

---

## Version History Summary

- **v1.2.0** - Hybrid self-harm screening, backup & restore, Expo SDK 57 compatibility update
- **v1.1.0** - Location-based support resources, background customization, enhanced themes, help system
- **v1.0.0** - Initial release with core grief journaling features

---

## Support

For support resources and crisis help, use the "!!!" button in the app or visit the Support Resources screen.

**Crisis Support:**
- US: 988 Suicide & Crisis Lifeline
- UK: 116 123 (Samaritans)
- International: See in-app resources for your region

---

## License

This project is private and intended for personal grief journaling use.

---

## Acknowledgments

This app was created to provide a safe, private space for individuals to process grief and maintain connections with loved ones who have passed away. The mental health screening and support resources are designed to provide help when needed while respecting the deeply personal nature of grief.
