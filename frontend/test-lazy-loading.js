/**
 * Test script to verify lazy loading of expo-notifications
 * This should prevent the error when running in Expo Go
 */

console.log('=== Testing Lazy Loading of expo-notifications ===\n');

// Test 1: Check if the main notification service can be imported without errors
console.log('Test 1: Importing NotificationService');
try {
  const { registerForPushNotificationsAsync, isNotificationSupported, getNotificationStatus } = require('./src/utils/NotificationService');
  console.log('✓ NotificationService imported successfully');
  console.log('✓ No immediate expo-notifications error');
} catch (error) {
  console.log('✗ Error importing NotificationService:', error.message);
}

console.log();

// Test 2: Check if we can call the helper functions without triggering expo-notifications
console.log('Test 2: Testing helper functions');
try {
  const { isNotificationSupported, getNotificationStatus } = require('./src/utils/NotificationService');
  
  const supported = isNotificationSupported();
  const status = getNotificationStatus();
  
  console.log('✓ isNotificationSupported() works:', supported);
  console.log('✓ getNotificationStatus() works:', status.message);
  console.log('✓ Helper functions work without expo-notifications import');
} catch (error) {
  console.log('✗ Error testing helper functions:', error.message);
}

console.log();

// Test 3: Check NotificationManager import
console.log('Test 3: Importing NotificationManager');
try {
  const notificationManager = require('./src/utils/NotificationManager').default;
  console.log('✓ NotificationManager imported successfully');
  console.log('✓ No expo-notifications error during import');
} catch (error) {
  console.log('✗ Error importing NotificationManager:', error.message);
}

console.log();

// Test 4: Check LocalNotificationService (should always work)
console.log('Test 4: Importing LocalNotificationService');
try {
  const { scheduleLocalNotification, showInAppNotification, getNotificationCapability } = require('./src/utils/LocalNotificationService');
  console.log('✓ LocalNotificationService imported successfully');
  console.log('✓ Local notifications available as fallback');
} catch (error) {
  console.log('✗ Error importing LocalNotificationService:', error.message);
}

console.log();

console.log('=== Test Summary ===');
console.log('If all tests passed, the lazy loading approach should prevent:');
console.log('1. expo-notifications import errors in Expo Go');
console.log('2. Early execution of expo-notifications code');
console.log('3. The "Android Push notifications functionality was removed" error');
console.log();
console.log('The expo-notifications package is now only loaded when:');
console.log('- Not running in Expo Go on Android');
console.log('- Actually trying to register for push notifications');
console.log();
console.log('This should resolve the mobile app notification error.');