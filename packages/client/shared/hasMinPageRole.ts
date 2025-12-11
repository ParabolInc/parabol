const PAGE_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const
type PageRoleEnum = (typeof PAGE_ROLES)[number]
export const hasMinPageRole = (
  roleRequired: PageRoleEnum,
  userRole: PageRoleEnum | null | undefined
) => {
  return userRole ? PAGE_ROLES.indexOf(userRole) <= PAGE_ROLES.indexOf(roleRequired) : false
}
