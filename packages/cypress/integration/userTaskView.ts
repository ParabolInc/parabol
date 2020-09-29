describe('userTaskView', () => {
  beforeEach(() => {
    cy.task('resetDb')
    cy.login()
    cy.visit('/me/tasks')
  })

  afterEach(() => {
    cy.task('resetDb')
  })

  it('shows default team and team member filter on /me/tasks', () => {
    cy.get('[data-cy=team-filter]').should('contain', 'My teams')
    cy.get('[data-cy=team-filter]').click()
    cy.get('[data-cy="team-filter-h-CdSRCnT"]').should('contain', 'cypress’s Team')

    cy.get('[data-cy=team-member-filter]').should('contain', 'cypress')
    cy.get('[data-cy=team-member-filter]').click()
    cy.get('[data-cy="team-member-filter-local|wnVeDjF-n"]').should('contain', 'cypress')
  })

  it('updates URL when filters are selected', () => {
    cy.get('[data-cy=team-filter]').click()
    cy.get('[data-cy="team-filter-h-CdSRCnT"]').click()
    cy.url().should('include', 'teamIds=h-CdSRCnT')

    cy.get('[data-cy=team-member-filter]').click()
    cy.get('[data-cy="team-member-filter-local|wnVeDjF-n"]').click()
    cy.url().should('include', 'userIds=local|wnVeDjF-n')
  })

  it('filters tasks by team filter', () => {
    // Create a new team
    cy.get('nav')
      .contains('Add a Team')
      .click()
    cy.get('form').within(() => {
      cy.get('input[name="teamName"]').type(`cypress's own team`)
      cy.root().submit()
      cy.location('pathname', {timeout: 10000}).should('match', new RegExp('/team/(.+)'))
      cy.wait(1000)
    })

    // Create a new task in the new team
    cy.get('[data-cy=add-task-Future]').click()
    cy.get('[data-cy=draggable-task-card-editor]')
      .type("New Task under cypress's own team")
      .type('{enter}')

    cy.url().then((url) => {
      const regex = /.+\/team\/(.+)/
      const newTeamId = url.replace(regex, '$1')
      cy.visit(`/me/tasks?teamIds=${newTeamId}`)

      cy.get('[data-cy=team-filter]').should('contain', `cypress's own team`)
      cy.get('[data-cy=draggable-task-card-editor]').contains("New Task under cypress's own team")
    })
  })
})
