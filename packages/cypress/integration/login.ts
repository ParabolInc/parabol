describe('login', () => {
  it('performs a login', () => {
    cy.visit('/')
    cy.get('form').within(() => {
      cy.get('input[name="email"]').type(`cypress@parabol.co`)
      cy.get('input[name="password"]').type('cypress')
      cy.root().submit()
      cy.location('pathname', {timeout: 10000}).should('eq', '/meetings')
    })
  })
  it('redirects when a login token is present', () => {
    cy.login()
    cy.visit('/')
    cy.location('pathname').should('eq', '/meetings')
  })
})
