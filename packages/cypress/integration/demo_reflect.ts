function addCard(column, text) {
  cy.get(`[data-cy=phase-item-editor-${column}-wrapper]`)
    .type('{selectall}')
    .type('{backspace}')
    .type(`${text}`)
    .should('have.text', `${text}`)
    .type('{enter}')
}

function editCard(column, oldText, newText) {
  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`)
    .find(`[data-cy=editor-wrapper]`)
    .as('reflection-card-edit')

  cy.get('@reflection-card-edit').should('have.text', `${oldText}`)

  cy.get('@reflection-card-edit')
    .type('{selectall}')
    .type('{backspace}')
    .type(`${newText}`)
    .should('have.text', `${newText}`)
}

function deleteCard(column) {
  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`).as('reflection-card-delete')

  cy.get('@reflection-card-delete')
    .find(`[data-cy=reflection-delete]`)
    .click()

  cy.get('@reflection-card-delete').should('not.exist')
}

const click = ($el) => {
  return $el.click()
}

describe('Test Reflect page Demo', () => {
  before(function () {
    // runs before all tests in the block
    cy.visitReflect()

  })

  beforeEach(() => {
    cy.viewport(1280, 720)
  })

  it('Test help menu toggle', () => {
    cy.get('[data-cy=help-menu-close]').should('not.exist')

    cy.get('[data-cy=tip-menu-toggle]')
      .should('be.visible')
      .click()

    cy.get('[data-cy=help-menu-close]')
      .should('be.visible')
      .pipe(click)
      .should('not.exist')

  })

  it('Test adding, editing, and deleting reflections', () => {
    addCard('Start', 'Start testing code before merging')

    cy.wait(500)
    cy.screenshot('add-start-column-reflection')

    addCard('Stop', 'Stop pushing directly to master')

    cy.wait(500)
    cy.screenshot('add-stop-column-reflection')

    addCard('Continue', 'Continue using code linters')

    cy.wait(500)
    cy.screenshot('add-continue-column-reflection')

    editCard('Start', 'Start testing code before merging', 'Start having daily standups')

    cy.screenshot('edit-start-column-reflection')

    editCard('Stop', 'Stop pushing directly to master', 'Stop creating merge conflicts')

    cy.screenshot('edit-stop-column-reflection')

    editCard('Continue', 'Continue using code linters', 'Continue using best practices')

    cy.screenshot('edit-continue-column-reflection')

    deleteCard('Start')

    deleteCard('Stop')

    deleteCard('Continue')
  })

  it('Test if can advance to groups', () => {
    cy.visitPhase('group')
  })
})
