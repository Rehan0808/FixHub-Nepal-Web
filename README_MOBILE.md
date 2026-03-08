# FixHub Nepal - Mobile App & Backend

This documentation covers the Mobile Application built with Flutter and its interaction with the FixHub Nepal Backend API.

## 🛠 Tech Stack

### Mobile App
- **Framework:** Flutter (Dart)
- **Architecture:** Feature-first approach with Clean Architecture principles.
- **State Management:** Provider
- **Local Storage:** Hive for caching and offline data.
- **Networking:** HTTP package for API consumption.
- **Security:** `local_auth` for Biometric (Fingerprint/FaceID) authentication.
- **Mapping:** `flutter_map` with OpenStreetMap.
- **Sensors:** Shake, Light, and Proximity sensor integration for unique UX features.
- **Notifications:** `flutter_local_notifications` for real-time alerts.

### Backend (API Support)
- **Core:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Prisma) & MongoDB (Mongoose)
- **Real-time:** Socket.io for mobile messages and notifications.
- **AI Bot:** Groq AI integration for in-app assistant.
- **Payment:** eSewa integration via WebViews and API callbacks.

## 🔥 Key Features (Mobile Specific)

- **Biometric Security:** Users can secure their profile and payments using fingerprint authentication.
- **Location Services:** Automatic location detection and map-based service searching.
- **Shake to Action:** Shake the device to trigger specific features (e.g., feedback or quick help).
- **Proximity & Light Sensors:** Dynamic UI adjustments based on environment (e.g., auto-theme switching or screen dimming).
- **Real-time Push Notifications:** Stay updated on booking statuses and messages.
- **eSewa Integration:** Seamless payment flow within the app.
- **Offline Mode:** Basic data access via Hive local storage.

## 🚀 Getting Started

### Mobile App Setup
1. Navigate to `fixhub-nepal-mobile`.
2. Ensure Flutter SDK is installed.
3. Fetch dependencies: `flutter pub get`.
4. Configure API endpoints in `lib/core/api/api_endpoints.dart`.
5. Run the app: `flutter run`.

### Backend for Mobile
1. Follow the same steps as the Web Backend documentation to set up the server.
2. Ensure the firewall or local network settings allow the mobile device to reach the local API server IP.

## 📂 Mobile Project Structure
- `lib/core/`: Common utilities, API clients, and constants.
- `lib/features/`: Modularized features (Auth, Home, Booking, Profile, etc.).
- `lib/theme/`: Custom UI theme and styles.
- `assets/`: Images and fonts used in the app.
