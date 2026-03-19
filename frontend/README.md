# BranchFlow Pro - Push Notifications Setup

## Important: Push Notifications Setup Required

This app uses push notifications for real-time shipment updates. Due to Expo SDK 54 changes, push notifications require a development build instead of Expo Go.

### What You Need to Do

#### Option 1: Create a Development Build (Recommended)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**:
   ```bash
   eas init
   ```

3. **Create Development Build**:
   ```bash
   eas build --profile development --platform all
   ```

4. **Install the Development Build**:
   - Download the APK from EAS build artifacts
   - Install on your Android device
   - Or use the development client URL provided by EAS

#### Option 2: Use Physical Device with Development Client

1. **Install Expo Development Client**:
   ```bash
   eas update --branch development --message "Update with notifications"
   ```

2. **Run on Physical Device**:
   ```bash
   eas update --branch development --message "Update with notifications"
   ```

### Why This Change is Necessary

- Expo SDK 54 removed push notification functionality from Expo Go
- Development builds provide full native functionality including push notifications
- This ensures reliable delivery of shipment notifications

### Testing Push Notifications

After setting up the development build:

1. **Grant Permissions**: The app will request notification permissions on first launch
2. **Test Notifications**: Use the backend API or test tools to send test notifications
3. **Verify Delivery**: Check that notifications appear on your device

### Troubleshooting

- **Permissions Denied**: Ensure you grant notification permissions when prompted
- **No Notifications**: Verify you're using a development build, not Expo Go
- **Build Issues**: Check EAS build logs for any errors

### Development Workflow

For ongoing development with push notifications:

1. Make code changes
2. Run `eas update` to push changes to development branch
3. Test on your development build
4. Use `eas build` for new native changes

This setup ensures you have full push notification functionality during development and testing.