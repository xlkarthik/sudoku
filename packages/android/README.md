# Sudoku Platform - Android

Native Android application built with Kotlin and Jetpack Compose.

## Requirements

- Android Studio Hedgehog | 2023.1.1+
- Android SDK 34+
- Kotlin 1.9+
- Gradle 8.0+

## Setup

1. Open the project in Android Studio
2. Sync Gradle files
3. Build and run on emulator or device

## Architecture

The Android app follows MVVM architecture with:
- Jetpack Compose for UI
- Kotlin Coroutines for async operations
- Room for local database
- Hilt for dependency injection
- Shared business logic from TypeScript core

## Build

```bash
# Build from command line
./gradlew assembleDebug
```

## Testing

```bash
# Run unit tests
./gradlew testDebugUnitTest

# Run instrumented tests
./gradlew connectedDebugAndroidTest
```