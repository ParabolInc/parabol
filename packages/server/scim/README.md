# Parabol SCIM Provisioning
An enterprise organization with verified domains (i.e. SAML enabled) can use SCIM to provision and de-provision users. The users that can be managed via SCIM are limited by the verified domains associated with the organization.
The SCIM setup is tightly coupled to the organization.

## User categories used here
- provisioned: users that were originally created via this SCIM provisioning
- domain-matched: users that belong to the verified domains associated with the organization
- externals: users that don't belong to the verified domains and were not provisioned via this SCIM but are members of the organization

SCIM provisioning **can**:
- provision users regardless of domain that will be added to the organization.
- update provisioned and domain-matched users.
- list provisioned, domain-matched, and external users in the organization.
- de-provision provisioned and domain-matched users.
- provision groups and group memberships for the organization, which will be reflected in Parabol as teams.

SCIM provisioning **cannot**:
- de-provision externals. They will be removed from the organization but not deleted from Parabol.
- update externals.
- apply roles.

## Notes
- Parabol supports deactivation of a user by setting `active=false` or hard deletion of a user via egress.
- deactivating a user via setting `active=false` will remothe from the organization and all associated teams. Re-provisioning them will not re-add team membership again. Externals will remain a Parabol user.
- degress will hard delete a user
- egress will list all users in the organization combined with users provisioned via this SCIM combined with users bolonging to the verified domains.
- all ingress will add the users (new and existing) to the organization regardless of their email domain.

## Attributes
The following attributes are supported for SCIM provisioning:
- `userName` (required): unused by Parabol, can be used to query users; will fall back to SAML PersistentNameID, NameID or email if unknown
- `emails` (required): Parabol will use the primary email provided, falling back to the first one; Parabol lowercases all email addresses
- `displayName`: the user's full name, can be changed locally in Parabol
- `externalId`: only stored and echoed back
- `active`: if set to false, the user will be deactivated and removed from the organization; if set to true, the user will be re-activated and added back to the organization but not to any teams
    - Microsoft Entra ID: to use the `active` attribute the flag `?aadOptscim062020` needs to be appended to the SCIM endpoint URL, e.g. `https://action.parabol.co/scim?aadOptscim062020`
- `name.givenName`: only stored and echoed back, guessed when unknown[^1]
- `name.familyName`: only stored and echoed back, guessed when unknown[^1]

[^1]: If `name.givenName` or `name.familyName` are unknown, the missing attribute(s) are guessed by the following algorithm:
    - if `displayName` consists of multiple parts (e.g. "Jane H. Doe"), then `name.givenName` will be the first, `name.familyName` the last part, (e.g. "Jane" and "Doe")
    - else if `email` consists of multiple parts separated by `.` (e.g. "jane.h.doe@example.com"), then `name.givenName` will be the first, `name.familyName` the last part, (e.g. "Jane" and "Doe")
    - else `name.givenName` will be set to `displayName` and `name.lastName` will be set to the email local part capitalized, so for "Jane<doe@example.com>" it will be "Jane" and "Doe"

## Warning
Org admins can be de-provisioned via SCIM, but currently users cannot be promoted to org admins via SCIM. Be sure to manually promote a new org admin before de-provisioning the last org admin.
