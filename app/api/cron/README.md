# Mini Headspace Cron Jobs

This directory contains automated tasks that run on a schedule using Vercel Cron Jobs.

## Daily Meditation Reminder

The `daily-reminder` cron job sends daily notifications to users who have:
1. Enabled meditation reminders in the app
2. Added the Frame via the Mini App (using `addFrame()` from `@coinbase/onchainkit/minikit`)
3. Not meditated today
4. Not received a notification in the last 24 hours

### How it works

1. **User opt-in**: Users must explicitly enable notifications in the app via the toggle button
2. **Frame addition**: Users must add the frame using the `addFrame()` API to provide a valid notification token
3. **Scheduled execution**: The cron job runs daily, checking which users need reminders
4. **Notification delivery**: Pushes notifications to eligible users via Farcaster Frames

### Technical implementation

- Notification preferences are stored in Redis with the key format `meditation:reminder:{fid}`
- Token and URL from the `addFrame()` result are stored for sending notifications
- The system also uses the notification service as a fallback mechanism

### Authentication

The cron job is protected by a `CRON_SECRET` environment variable to ensure only legitimate Vercel Cron requests can trigger the job.

### Testing

You can test the reminder API endpoints with the script in `scripts/test_meditation_reminder.sh`. 