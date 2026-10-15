# Daybook Desktop — Delivery and Verification Status

This project packages the existing Daybook HTML interface as a Windows desktop app with Electron and provides a one-click Windows build script.

## Included in this source package

- Existing Daybook interface bundled locally; no web server is required to display the UI.
- Electron desktop window with context isolation, sandboxing, and Node integration disabled in the renderer.
- Local browser storage persisted in the Electron application profile.
- `Build-Daybook.bat`: double-click to install dependencies and build a Windows installer.
- `Run-Daybook.bat`: run the development version after dependencies are installed.
- NSIS installer configuration with Start Menu and desktop shortcuts.

## Important verification status

The source project is prepared, but this package has **not been built or smoke-tested on the user's Windows laptop**. Therefore, do not treat all quality-assurance tasks as completed or assume that no errors are possible. A successful installer build and the checks below must be completed on the target machine.

## Required target-machine smoke tests

1. Build the installer and confirm the process finishes successfully.
2. Install Daybook and launch it from the desktop shortcut.
3. Add, edit, complete, undo, and delete tasks.
4. Close and reopen the app; confirm tasks remain.
5. Test task dates, date navigation, filters, and history.
6. Test reminder permissions and a scheduled reminder while the app is open.
7. Test resizing, display scaling, and light/dark appearance.
8. Back up the app's user data before relying on it for important information.

## Current limitations

- Tasks are stored using Chromium localStorage, not SQLite. The data is local to this Windows user profile and is not synced across devices.
- Reminders are checked while Daybook is running. A fully closed app cannot be relied on to deliver reminders.
- Browser/Windows notification behavior depends on OS settings and permission.
- Demo/sample tasks are initially displayed when there is no saved data; remove them and enter your own tasks.
- A successful build is not a substitute for a test run on the target laptop.
