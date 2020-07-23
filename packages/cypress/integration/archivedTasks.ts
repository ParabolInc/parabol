describe('archivedTasks', () => {
  it('goes to /archive in team view', () => {
    cy.login()

    // shows sidebar
    cy.get('nav')
      .contains('cypress')
      .click()
    cy.url().should('include', '/team')

    cy.get('div')
      .contains('Archived Tasks')
      .click()
    cy.url().should('include', 'archive')
    cy.get('body').should('contain', 'There are zero archived tasks')

    cy.get('div')
      .contains('Back to Team Tasks')
      .click()
    cy.url().should('not.include', 'archive')
    cy.get('body').should('contain', 'This is a task card')
  })
  it('goes to task view and click the archived task checkbox', () => {
    cy.login()

    cy.get('nav')
      .contains('Tasks')
      .click()
    cy.url().should('include', 'tasks')

    cy.wait(1000)

    cy.get('button')
      .contains('Show Archived Tasks')
      .click()
    cy.get('body').should('contain', 'There are zero archived tasks')

    cy.get('button')
      .contains('Show Archived Tasks')
      .click()
    cy.get('body').should('contain', 'This is a task card')
  })
})
