# Daybook Desktop (Windows)

Daybook is packaged as a standalone Windows desktop application using Electron. The original planner UI is retained, with the cloud-host-specific adapter removed so this edition stores data locally on this laptop. Google Fonts were removed so the app does not need the internet to render its UI.

## Requirements

- Windows 10/11, 64-bit
- Node.js LTS (includes npm)
- Internet connection for the first dependency install/build only

## One-click Windows build

1. Install Node.js LTS if it is not already installed: https://nodejs.org/en/download
2. Extract this folder to a normal writable folder.
3. Double-click **`Build-Daybook.bat`**.
4. Wait for dependency installation and packaging to finish. The `release` folder opens automatically when the build succeeds.
5. Run the generated Daybook Setup `.exe` to install the app.

The first build needs an internet connection to download dependencies. This script automates the dependency install and installer build; it cannot automatically verify every behavior on your laptop.

## Run from source

1. Install Node.js LTS from https://nodejs.org/.
2. Extract this folder to a normal writable folder, e.g. `C:\Users\YourName\Documents\Daybook`.
3. Open PowerShell in this folder.
4. Run:

   ```powershell
   npm install
   npm start
   ```

## Build a Windows installer

From PowerShell in this folder:

```powershell
npm install
npm run dist:win
```

The installer will be created in `release`. Run the generated setup `.exe` and follow the installer. A desktop shortcut will be created.

## Data and privacy

- The app does not require a login or a cloud service.
- Tasks use the Chromium local-storage profile managed by Electron, which persists between app launches on this Windows user account.
- Keep the app installed and do not clear its application data if you want to preserve tasks.
- Before using it for important planning, test creating, editing, completing, deleting, and reopening tasks.

See `PROJECT_STATUS.md` for delivery status and the required laptop smoke tests.

## Important limitations

- This source project has not been built or tested on your specific laptop yet. A clean build and real-machine smoke test are still required before calling it error-free.
- Reminders are checked while the application is running. Windows notification permission and notification behavior must be tested on the target laptop; reminders are not guaranteed if the app is fully closed.
- The first run uses the existing sample tasks in the original app when no saved tasks exist. You can delete those and add your own.
- This is a local single-user edition. It does not synchronize tasks across devices.

## Smoke-test checklist

- [ ] App opens without a blank screen or DevTools error.
- [ ] Add, edit, complete, and delete a task.
- [ ] Close and reopen the app; verify tasks remain.
- [ ] Navigate between dates and verify tasks appear on the correct date.
- [ ] Test a reminder with the app open and confirm Windows notification settings.
- [ ] Restart Windows and confirm the app and saved data still work.
- [ ] Test light/dark theme and resize the window.
