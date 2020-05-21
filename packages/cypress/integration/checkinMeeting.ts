describe('Test check-in meeting', () => {
  it('Check that all personal votes are remaining and no team votes have been used', () => {
    cy.login()
    cy.wait(1000)
    cy.contains('Start meeting')
  })
})
