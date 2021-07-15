export const SprintPokerErrors = {
  fixMissingFieldError:
    'Couldn’t fix the missing field! In Jira, use "Find my field" to determine the error',
  updateFieldError: (fieldName: string) =>
    `Update failed! In Jira, add the field "${fieldName}" to the Issue screen.`
}
