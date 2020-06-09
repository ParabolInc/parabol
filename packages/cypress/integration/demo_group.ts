function addReflection(column, text) {
  cy.get(`[data-cy=add-reflection-${column}]`).click()

  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .last()
    .find(`[data-cy=editor-wrapper]`)
    .as('add-reflection-card')

  cy.get('@add-reflection-card')
    .type(`${text}`)
    .should('have.text', `${text}`)

  cy.get('@add-reflection-card').type('{enter}')

  cy.wait(500)
}

function checkGroup(column, number) {
  cy.get(`[data-cy=${column}-group-0-stack]`)
    .children()
    .should('have.length', number)
}

function createGroup(column1, column2) {
  cy.get(`[data-cy=group-column-${column1}-body]`)
    .children()
    .last()
    .find(`[data-cy=group-title-editor-input]`)
    .should('not.exist')

  cy.get(`[data-cy=group-column-${column2}-body]`)
    .children()
    .last()
    .find(`[data-cy=group-title-editor-input]`)
    .should('not.exist')

  cy.get(`[data-cy=group-column-${column1}-body]`)
    .children()
    .last()
    .trigger('mousedown')

  cy.get(`[data-cy=group-column-${column2}-body]`)
    .children()
    .last()
    .trigger('mousemove')
    .trigger('mouseup')

  cy.get(`[data-cy=group-column-${column2}-body]`)
    .children()
    .last()
    .find(`[data-cy=group-title-editor-input]`)
    .should('exist')
}

function editReflection(column, oldText, newText) {
  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .last()
    .find(`[data-cy=editor-wrapper]`)
    .as('reflection-card-edit')

  cy.get('@reflection-card-edit').should('have.text', `${oldText}`)

  cy.get('@reflection-card-edit')
    .click()
    .type('{selectall}')
    .type('{backspace}')
    .type(`${newText}`)
    .should('have.text', `${newText}`)
}

function deleteReflection(column, text) {
  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .last()
    .as('reflection-card-delete')

  cy.get('@reflection-card-delete')
    .find(`[data-cy=editor-wrapper]`)
    .should('have.text', `${text}`)

  cy.get('@reflection-card-delete')
    .click()
    .find(`[data-cy=reflection-delete]`)
    .click()

  cy.get('@reflection-card-delete')
    .find(`[data-cy=editor-wrapper]`)
    .should('not.have.text', `${text}`)
}

function editGroupTitle(column, newText) {
  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .last()
    .as('group-title-edit')

  cy.get('@group-title-edit')
    .click()
    .find(`[data-cy=group-title-editor-input]`)
    .type('{selectall}')
    .type('{backspace}')
    .type(`${column}-${newText}`)
    .type('{enter}')
    .should('have.value', `${column}-${newText}`)
}

describe('Test Group page Demo', () => {
  before(function () {
    // runs before all tests in the block
    cy.visitReflect().visitPhase('group')

    cy.screenshot('visit-group')

  })

  it('Test adding a new reflection during grouping', () => {
    cy.screenshot('move-group-1')
    cy.screenshot('move-group-2')
    cy.screenshot('move-group-3')

    addReflection('Start', 'Start testing code before merging')

    cy.screenshot('move-group-4')

    addReflection('Stop', 'Stop pushing directly to master')

    cy.screenshot('move-group-5')

    addReflection('Continue', 'Continue using best practices')

  })

  it('Test editing a new reflection during grouping', () => {
    editReflection('Start', 'Start testing code before merging', 'Start having daily standups')

    editReflection('Stop', 'Stop pushing directly to master', 'Stop creating merge conflicts')

    editReflection('Continue', 'Continue using best practices', 'Continue using code linters')
  })

  it('Test renaming a group', () => {
    editGroupTitle('Start', 'Meetings')

    editGroupTitle('Stop', 'Conflicts')

    editGroupTitle('Continue', 'Code Quality')
  })

  it('Test deleting a reflection after it has been created', () => {
    deleteReflection('Start', 'Start having daily standups')

    deleteReflection('Stop', 'Stop creating merge conflicts')

    deleteReflection('Continue', 'Continue using code linters')
  })

  it('Test new group creation', () => {
    addReflection('Start', 'New Group 1')

    addReflection('Stop', 'New Group 2')

    createGroup('Start', 'Stop')

  })

  it('Verify that robots can group cards', () => {
    checkGroup('Start', 3)

    checkGroup('Continue', 3)
  })

  it('Test advancing to voting', () => {
    cy.visitPhase('vote')
  })
})
