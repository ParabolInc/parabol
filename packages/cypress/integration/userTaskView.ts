describe('userTaskView', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/me/tasks')
  })

  it('shows default team and team member filter on /me/tasks', () => {
    cy.get('[data-cy=team_filter]').should('contain', 'My teams')
    cy.get('[data-cy=team_filter]').click()
    cy.get('[data-cy="team_filter_h-CdSRCnT"]').should('contain', 'cypress’s Team')

    cy.get('[data-cy=team_member_filter]').should('contain', 'My team members')
    cy.get('[data-cy=team_member_filter]').click()
    cy.get('[data-cy="team_member_filter_local|wnVeDjF-n"]').should('contain', 'cypress')
  })

  it('updates URL when filters are selected', () => {
    cy.get('[data-cy=team_filter]').click()
    cy.get('[data-cy="team_filter_h-CdSRCnT"]').click()
    cy.url().should('include', 'teamId=h-CdSRCnT')

    cy.get('[data-cy=team_member_filter]').click()
    cy.get('[data-cy="team_member_filter_local|wnVeDjF-n"]').click()
    cy.url().should('include', 'userId=local|wnVeDjF-n')
  })
})
