describe('signup', () => {
  it('creates a new user with password', () => {
    cy.visit('/create-account')
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(`cypress+${Date.now()}@parabol.co`)
      cy.get('input[name="password"]').type('cypress')
      cy.root().submit()
      cy.location('pathname', {timeout: 10000}).should('eq', '/me')
    })
  })
  it('performs a login when matches existing credentials', () => {
    cy.visit('/create-account')
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(`cypress@parabol.co`)
      cy.get('input[name="password"]').type('cypress')
      cy.root().submit()
      cy.location('pathname').should('eq', '/me')
    })
  })
})
