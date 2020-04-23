function addCard(column, text) {
  cy.get(`[data-cy=phase-item-editor-${column}-wrapper]`)
    .as('column-phase-item-editor')

  cy.get('@column-phase-item-editor')
    .type(`${text}`)
    .should('have.text', `${text}`)

  cy.get('@column-phase-item-editor')
    .type('{enter}')

}

function editCard(column, oldText, newText) {
  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`).find(`[data-cy=editor-wrapper]`)
    .as('reflection-card-edit')

  cy.get('@reflection-card-edit')
    .should('have.text', `${oldText}`)

  cy.get('@reflection-card-edit')
    .type('{selectall}').type('{backspace}').type(`${newText}`)
    .should('have.text', `${newText}`)

}

function deleteCard(column) {

  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`)
    .as('reflection-card-delete')

  cy.get('@reflection-card-delete').find(`[data-cy=reflection-delete]`).click()

  cy.get('@reflection-card-delete').should('not.exist')

}

describe('Test Reflect page Demo', () => {

  before(function () {
    // runs before all tests in the block
    cy.visitReflect()

  })

  it('Test help menu toggle', () => {

    cy.get('[data-cy=help-menu-close]').should('not.exist')

    cy.get('[data-cy=tip-menu-toggle]').should('be.visible').click()

    cy.get('[data-cy=help-menu-close]').should('be.visible').click().should('not.exist')

  })

  it('Test adding, editing, and deleting reflections', () => {

    addCard('Start', 'Start column reflection')

    addCard('Stop', 'Stop column reflection')

    addCard('Continue', 'Continue column reflection')

    editCard('Start', 'Start column reflection', 'Edit reflection')

    editCard('Stop', 'Stop column reflection', 'Edit reflection')

    editCard('Continue', 'Continue column reflection', 'Edit reflection')

    deleteCard('Start')

    deleteCard('Stop')

    deleteCard('Continue')
  })

  it('Test if can advance to groups', () => {

    cy.visitPhase('group')

  })

})
