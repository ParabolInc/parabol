
function addCard(column) {
  cy.get(`[data-cy=reflection-column-${column}]`)
      .find(`[data-cy=phase-item-editor-${column}]`)
      .find('[data-cy=reflection-editor]')
      .as('column-phase-item-editor')
    
  cy.get('@column-phase-item-editor')
    .type('fake@email.com')
    .should('have.text', 'fake@email.com')

  cy.get('@column-phase-item-editor')
    .type('{enter}')
  
  cy.wait(500)

}

function editCard(column) {
  cy.get(`[data-cy=reflection-column-${column}]`)
    .find(`[data-cy=reflection-stack-${column}]`)
    .find(`[data-cy=reflection-stack-${column}-card-0]`)
    .find('[data-cy=reflection-editor]')
    .as('reflection-card-edit')

  cy.get('@reflection-card-edit')
    .should('have.text', 'fake@email.com')

  cy.get('@reflection-card-edit')
    .type('{selectall}').type('{backspace}').type('newemail.com')
    .should('have.text', 'newemail.com')

}

function deleteCard(column) {
      
  cy.get(`[data-cy=reflection-column-${column}]`)
    .find(`[data-cy=reflection-stack-${column}]`)
    .find(`[data-cy=reflection-stack-${column}-card-0]`)
    .find(`[data-cy=reflection-stack-${column}-card-0-delete]`)
    .as('reflection-card-delete')

  cy.get('@reflection-card-delete').click()
}

describe('Test Reflect page Demo', () => {
  beforeEach(function() {
    // runs before each test in the block
    cy.visit('/retrospective-demo/reflect')
    cy.get('[data-cy=start-demo-button]').should('be.visible').click()

    cy.get('[data-cy=sidebar-header]').find('button').should('be.visible').click()


  })

  it('Test help menu toggle', () => {

    cy.get('[data-cy=help-menu-toggle]').should('be.visible')
    
    cy.get('[data-cy=help-menu-close]').should('be.visible').click()

    cy.get('[data-cy=help-menu-close]').should('not.exist')
    
    cy.get('[data-cy=help-menu-toggle]').should('be.visible').click().get('[data-cy=help-menu-close]').should('be.visible')

  })

  it('Test adding, editing, and deleting reflections', () => {

    addCard('Start')

    addCard('Stop')

    addCard('Continue')

    editCard('Start')

    editCard('Stop')

    editCard('Continue')
  
    deleteCard('Start')

    deleteCard('Stop')

    deleteCard('Continue')
  })

})
