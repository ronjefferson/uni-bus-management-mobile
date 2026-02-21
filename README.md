# University Bus Pass & Attendance Management System

Mobile frontend for the University Bus Pass & Attendance Management System. This Expo + React Native app connects to a Django REST backend to manage student transportation, bus pass requests, and attendance tracking. The app provides role-based views for Students, Parents and Administrators.

## Features

### Student Features
- **Authentication & Profile**: Login and manage student profile, token-based auth via backend
- **View Schedule**: See assigned bus routes and schedules
- **Attendance History**: View recent scan logs and boarding history
- **Request Bus Pass**: Submit temporary/emergency bus pass requests
- **Push Notifications**: Receive FCM notifications about passes and schedules

### Parent Portal
- **Child Linking**: Link and view registered students
- **Attendance Monitoring**: View attendance history for linked children
- **Schedule Viewing**: View bus schedules for each child
- **Notifications**: Receive alerts via FCM

### Admin Dashboard (mobile)
- **View Students & Parents**: Browse accounts and relationships
- **Approve/Reject Requests**: Manage bus-pass requests
- **Scan Log Preview**: Inspect recent boarding records

## Technology Stack

* [![Expo](https://img.shields.io/badge/Expo-%7E54.0.25-4dc0b5?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
* [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
* [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
* [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
* [![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Messaging-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
* [![Expo Router](https://img.shields.io/badge/Expo%20Router-6.x-282C34?style=for-the-badge)](https://docs.expo.dev/router/)
* [![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge)](https://github.com/axios/axios)
* [![ESLint](https://img.shields.io/badge/ESLint-9.25.0-4B32C3?style=for-the-badge&logo=eslint)](https://eslint.org)

## Prerequisites

- Node.js (LTS)
- npm or yarn
- Backend API (Django REST) running and reachable; configure API base URL in app settings

## Installation (Local Development)

1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>   # change to the folder created by the clone
```

2. (If applicable) enter the app subfolder

```bash
cd my-app               # only if your app is in a subfolder named "my-app"
```

3. Install dependencies

```bash
npm install
```

4. Configure environment

- Set API base URL and any feature flags via environment variables or `app.json`/`.env` as used by the project.

5. Start Expo

```bash
npx expo start
# to run on Android emulator/device
npm run android
```

## Connecting to Backend

This mobile app expects a REST API backend (example: Django REST API). Configure the API base URL in your environment; common endpoints include:

- `POST /api/token/` � login (JWT)
- `GET /api/students/me/` � student profile
- `POST /api/students/requests/` � create bus-pass request
- `POST /api/notifications/register-device/` � register FCM token

(Backend examples and full API docs live in the server repository.)

## Project Structure

```
my-app/
+-- app/                  # Expo Router routes (admin, parent, student, auth)
+-- assets/               # Images and static assets
+-- components/           # Reusable UI components
+-- src/features/         # Feature modules (admin, auth, parent, student)
+-- scripts/              # Utility scripts (reset-project.js)
+-- android/              # Android native project files
+-- package.json
+-- README.md
```

## Testing

- Run linters: `npm run lint`
- Expo run/debug: `npx expo start`

## License

See the `LICENSE` file in the repository root.

