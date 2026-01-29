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

SCIM provisioning **cannot**:
- de-provision externals. They will be removed from the organization but not deleted from Parabol.
- update externals.
- manage groups/teams.
- apply roles.

## Notes
- degress will remove a user from the organization and all associated teams. Re-provisioning them will not re-add team membership again. Externals will remain a Parabol user.
- egress will list all users in the organization combined with users provisioned via this SCIM combined with users bolonging to the verified domains.
- all ingress will add the users (new and existing) to the organization regardless of their email domain.

## Attributes
The following attributes are supported for SCIM provisioning:
- `userName`: Unused by Parabol, can be used to query users. Defaults to the user's email if not provisioned via SCIM.
- `displayName`: The user's full name.
- `emails` (required): Parabol will use the primary email provided, falling back to the first one
- `externalId`: Only stored and repeated back

## Warning
Org admins can be de-provisioned via SCIM, but currently users cannot be promoted to org admins via SCIM. Be sure to manually promote a new org admin before de-provisioning the last org admin.
