describe('me', () => {
  it('shows the timeline', () => {
    cy.login()
    cy.visit('/me')

    // shows timeline items
    cy.get('body').should('contain', 'You created cypress+1’s Team')

    // shows active column
    cy.get('body').should('contain', 'This is a task card')

    // shows sidebar
    cy.get('nav')
      .contains('cypress+1')
      .click()
    cy.url().should('include', '/team')
  })
})
