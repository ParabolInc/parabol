# Vendor comparison: error monitoring

We are replacing the home-grown error tracker. All three vendors ran against staging for two weeks. Ingrid owns the decision and wants it by Nov 6.

| Criteria | Quillstream | Brightkiln | Marrowfield |
| --- | --- | --- | --- |
| Price per month for 50 engineers | $1,450 | $1,100 | $2,300 |
| Data retention | 90 days | 30 days | 180 days |
| SAML single sign-on | Included | Enterprise plan only | Included |
| Slack integration | Yes | Yes | Beta |
| Self-hosting option | No | Yes | No |
| Trial verdict | Best triage workflow | Cheapest but noisy grouping | Best retention but expensive |

## Recommendation

Go with Quillstream, pending the security review. It grouped errors most accurately during the trial and its price fits the tooling budget. Brightkiln is the fallback if Quillstream fails the review.
