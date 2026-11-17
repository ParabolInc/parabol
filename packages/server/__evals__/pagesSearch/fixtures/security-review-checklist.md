# Security review checklist

Run through this list before any change that touches customer data, authentication or a new third party. Link the completed list in the pull request.

- [ ] Describe which customer data the change reads, writes or stores
- [ ] New endpoints check that the caller belongs to the team that owns the data
- [ ] Secrets live in the vault and never appear in the repository or build logs
- [ ] Dependencies are scanned and no critical vulnerability is older than seven days
- [ ] Logs and error reports exclude card numbers and personal data
- [ ] Third-party vendors support single sign-on and role-based access
- [ ] A threat model is attached for any change that adds a new way to sign in
- [ ] A penetration test is scheduled for major changes
