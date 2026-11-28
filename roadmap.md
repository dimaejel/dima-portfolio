# Portfolio media persistence
- [x] Reproduce missing public media on the deployed website and identify the permission failure.
- [x] Separate visitor access from admin permission checks; retain private unused uploads.
- [ ] Make all media editors persist references before reporting success; add certificate uploads without redesigning cards.
- [ ] Test storage permissions, new uploads, refresh, sign-out, and fresh desktop/mobile browsers on production.

# Contact form
- [x] Test Resend's permitted test sender to the owner's Gmail: provider reports delivered.
- [x] Enable a permitted domain-free notification path, keeping saved messages successful if notification fails.
- [x] Verify real form storage plus notification: actual public form submitted, row confirmed, Resend reports delivered to Gmail; only the test row removed.
- [x] Preserve the Contact appearance and saved admin inbox messages.
- [x] Add shared client/server validation, bounded inputs, honeypot, duplicate-submit prevention, and safe errors.
- [x] Connect Resend; owner-only test sender confirmed permitted, so a custom domain is not required for current notifications.
- [x] Keep saved-message success working without a sender domain; do not claim email delivery.
- [x] Add approved custom spam limit: three submissions per visitor every ten minutes; database tests passed.
- [x] Verify real form storage end-to-end: submitted through the public form, confirmed the saved row, and removed only that test entry. Retry preservation and mobile form verified.