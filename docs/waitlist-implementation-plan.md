# Waitlist Implementation Plan

WorkflowGuard AI should not collect real emails until a privacy notice, retention policy, and backend choice are ready.

## Required Before Collection

- Public privacy notice for email collection.
- Clear statement that no workflow files are collected with the email.
- Data retention period.
- Unsubscribe process.
- Provider review.
- Double opt-in decision.

## Later Backend Options

- Buttondown.
- ConvertKit.
- Loops.
- Lemon Squeezy waitlist.
- Custom endpoint.

No option should be wired until the provider, consent language, and deletion process are documented.

## Recommended Fields

- Email only.

Do not collect names, company names, workflow files, production URLs, or free-text workflow descriptions at the MVP waitlist stage.

## Double Opt-In

Use double opt-in if the provider supports it. It reduces list quality ambiguity and makes consent easier to reason about.

## Data Retention

Delete unconfirmed emails after a short retention window. Delete unsubscribed contacts from active launch messaging lists.

## Analytics

Do not add analytics until the privacy notice explains what is collected, why it is collected, and how users can opt out.