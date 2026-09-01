/**
 * Central configuration for third-party services.
 *
 * All keys are PLACEHOLDERS. Fill in real values before building for release.
 * Native build reads these via prebuild; secrets are compiled into the app.
 */

export const appConfig = {
  firebase: {
    // From google-services.json (Android) / GoogleService-Info.plist (iOS)
    // downloaded from Firebase console → Project settings → Your apps.
    androidGoogleServicesFile: './google-services.json',
    iosGoogleServicesFile: './GoogleService-Info.plist',
  },

  googleSignIn: {
    // iOS URL scheme: com.googleusercontent.apps.<YOUR_IOS_CLIENT_ID>
    // Android uses the SHA-1 in your Firebase project, no scheme needed here.
    iosUrlScheme: 'com.googleusercontent.apps.YOUR_IOS_CLIENT_ID',
    // Web client ID from Firebase → Authentication → Sign-in method → Google.
    webClientId: '1086415499988-cdg19o8t7mutvst6cvjmc6l5hcdhddep.apps.googleusercontent.com',
  },

  supabase: {
    // https://app.supabase.com → project → Settings → API
    url: 'https://msdezqttjznjumyhxizv.supabase.co',
    anonKey: 'sb_publishable_x0MzXmTQbBqVUTiVQ90HbA_ODVDbr0x',
  },

  jitsi: {
    // Default public meet server; replace with your own Jitsi server for production.
    serverUrl: 'https://meet.jit.si',
    // Optional: token/auth for secured rooms (matterbridge / jwt). Empty = open rooms.
    jwtToken: '',
  },
} as const;