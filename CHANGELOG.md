
# Changelog

All notable changes to the Say It Anyway: Grief Journal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Internal testing version released
This was the initial build of the application, the notes below show several iterations that happened prior to the app making it to test and then production.

### Added
- Initial changelog documentation for GitHub pages

## [1.0.0] - 2024

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
  - First-person expression detection
  - Automatic support resources display when flagged
  - Emergency "!!!" button for immediate access to resources

- **Location-Based Support Resources**
  - Regional support resource customization
  - Device locale detection for default region
  - Support for multiple countries/regions worldwide
  - Crisis hotlines by region
  - Text line services
  - Emergency contact numbers
  - Localized support messages

- **Supported Regions**
  - United States
  - United Kingdom
  - Canada
  - Australia
  - New Zealand
  - Ireland
  - India
  - South Africa
  - Germany
  - France
  - Spain
  - Italy
  - Netherlands
  - Belgium
  - Switzerland
  - Austria
  - Sweden
  - Norway
  - Denmark
  - Finland
  - Japan
  - South Korea
  - Singapore
  - Hong Kong
  - Mexico
  - Brazil
  - Argentina
  - Chile

- **Theme System**
  - 6-8 calming color themes
  - Light and dark mode support
  - Custom color palette creation
  - Theme persistence across sessions
  - Visually pleasing, accessible design

- **Background Customization**
  - Scene selection (Ocean, Forest, Mountains, Moody Sky, Dawn, Dusk)
  - Custom photo upload for backgrounds
  - Transparency slider for background opacity
  - Dynamic background generation based on color palette
  - Local photo picker integration

- **User Interface**
  - Mobile-first, one-hand friendly design
  - Calm, empathetic language throughout
  - Accessible design patterns
  - Smooth animations and transitions
  - Native iOS and Android support
  - Platform-specific optimizations

- **Data Management**
  - Local storage using AsyncStorage
  - Offline-first architecture
  - No cloud backend required
  - Secure data persistence
  - UUID-based unique identifiers

- **Help & Support**
  - In-app help modal with feature explanations
  - Support resources screen with crisis contacts
  - Calm, non-clinical language
  - Easy access to emergency services

### Changed
- **Storage Migration**
  - Migrated from SecureStore to AsyncStorage to avoid size limitations
  - Improved data handling for larger recipient and message collections

### Removed
- **Profile Feature**
  - Removed Profile section (single-user app)
  - Removed Profile navigation option
  - Removed Profile references from help documentation
  - Removed Home button (redundant on home screen)

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
- Export/backup functionality
- Reminder notifications
- Memorial date tracking
- Photo galleries for recipients

---

## Version History Summary

- **v1.0.0** - Initial release with core grief journaling features, location-based support resources, and comprehensive customization options

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
