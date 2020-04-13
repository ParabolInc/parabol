// Adds the task in cypress and returns an index to use for editing and replying to the task
function addTask(text) {
  cy.get(`[data-cy=discuss-input-add]`).click()

  cy.get(`[data-cy=discuss-thread-list]`)
    .children()
    .last()
    .as('add-discuss-task')
  
  return new Cypress.Promise((resolve, reject) => {
      cy.get('@add-discuss-task').invoke('index').then((i) => {
        i = i - 2
        
        cy.get(`[data-cy=thread-item-${i}-task-card-editor]`)
          .should('be.visible')
          .type(`${text}`)
          .should('have.text', `${text}`)
      
        cy.get(`[data-cy=thread-item-${i}-task-card-editor]`)
          .type('{enter}')

        resolve(i)
      })
  })  

}

function editTask(text, idx) {

  cy.get(`[data-cy=thread-item-${idx}-task-card-editor]`)
    .as('edit-discuss-task')

  cy.get('@edit-discuss-task')
    .type('{selectall}').type('{backspace}').type(`${text}`)
    .should('have.text', `${text}`)

  cy.get('@edit-discuss-task').type('{enter}')

  cy.get('@edit-discuss-task').should('have.text', text)
}

function replyComment(text, idx, child) {

  cy.get(`[data-cy=thread-item-${idx}-task-reply-button]`).click()
    
  cy.get(`[data-cy=thread-item-${idx}-task-reply-input-editor]`)
    .type(`${text}`)
    .should('have.text', `${text}`)
  
  cy.get(`[data-cy=thread-item-${idx}-task-reply-input-send]`).click()

  cy.get(`[data-cy=thread-item-${idx}-child-comment-${child}-editor]`)
    .should('have.text', `${text}`)

}

function replyTask(text, idx, child) {

  cy.get(`[data-cy=thread-item-${idx}-task-reply-button]`).click()

  cy.get(`[data-cy=thread-item-${idx}-task-reply-input-add]`).click()

  cy.get(`[data-cy=thread-item-${idx}-child-task-${child}-card-editor]`)
    .should('be.visible')
    .type(`${text}`)
    .should('have.text', `${text}`)
  
  cy.get(`[data-cy=thread-item-${idx}-child-task-${child}-card-editor]`)
    .type('{enter}')
  
  cy.get(`[data-cy=thread-item-${idx}-child-task-${child}-card-editor]`)
    .should('have.text', `${text}`)
}

function addComment(text) {

  cy.get('[data-cy=discuss-input-editor]')
    .wait(500)
    .type(`${text}`)
    .should('have.text', `${text}`)

  cy.get('[data-cy=discuss-input-editor]')
    .type('{enter}')

  cy.get(`[data-cy=discuss-thread-list]`)
    .children()
    .last()
    .as('add-discuss-comment')

  return new Cypress.Promise((resolve, reject) => {
    cy.get('@add-discuss-comment').invoke('index').then((i) => {
      i = i - 2;
      cy.get(`[data-cy=thread-item-${i}-comment-editor]`)
        .should('have.text', `${text}`)
      
      resolve(i)
    })

  })  

}

function editComment(text, idx) {

  cy.get(`[data-cy=thread-item-${idx}-comment-editor]`)
    .as('edit-discuss-comment')
  
  cy.get(`[data-cy=thread-item-${idx}-comment-dropdown-menu]`).click()
  
  cy.get(`[data-cy='edit-comment']`).click()

  cy.get('@edit-discuss-comment')
    .type('{selectall}').type('{backspace}').type(`${text}`)
    .should('have.text', `${text}`)

  cy.get('@edit-discuss-comment').type('{enter}')

  cy.get('@edit-discuss-comment').should('have.text', text)
}

function deleteComment(idx) {
  
  cy.get(`[data-cy=thread-item-${idx}-comment-dropdown-menu]`).click()
  
  cy.get(`[data-cy=delete-comment]`).click()

}

let taskIndex;

let commentIndex;

describe('Test Discuss page Demo', () => {

  before(function() {
    // runs before all tests in the block
    cy.visitReflect().visitPhase('group').visitPhase('vote').visitPhase('discuss','/1')
    
    cy.wait(10000)

    cy.get(`[data-cy=help-menu-toggle]`).click()
  })


  it('can create a new task', () => {
    addTask('New Task created').then((result) => {
      taskIndex = result
    })
  })

  it('can edit a created task', () => {
    editTask('Edited the task', taskIndex)
  })

  it('can reply to a created task', () => {
    replyComment('Replied to task', taskIndex, 0)
  })

  it('can reply to a created task with a task', () => {
    replyTask('Replied to task with task', taskIndex, 1)

  })

  it('can create a new comment in discussion board', () => {
    addComment('New comment created').then((result) => {
      commentIndex = result
    })
  })

  it('can edit a created comment in discussion board', () => {
    editComment('Edited the comment', commentIndex)
  })

  it('can delete a created comment in discussion board', () => {
    deleteComment(commentIndex)
  })

  it.skip('can "publish" a task to "JIRA" (this is simulated)', () => {
    
  })

  it.skip('can advance to a new discussion item', () => {
    
  })

  it.skip('can navigate back to a previous item', () => {
    
  })

  it.skip('can still add a new task', () => {
    
  })

  it.skip('can end meeting', () => {
    
  })

  it.skip('can see a meeting summary', () => {
    
  })
  
  it.skip('can click CTA', () => {

  })
  
  
})