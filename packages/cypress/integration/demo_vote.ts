function addVote(column, cardIndex, sum) {
  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .eq(cardIndex)
    .find(`[data-cy=reflection-vote-row]`)
    .as('vote-card')

  cy.get('@vote-card')
    .find(`[data-cy=completed-vote-count]`)
    .should('exist')
    .should('have.text', `${sum}`)

  cy.get('@vote-card')
    .find(`[data-cy=add-vote]`)
    .as('add-vote')

  cy.get('@add-vote').click()

  cy.get('@vote-card')
    .find(`[data-cy=completed-vote-count]`)
    .should('exist')
    .should('have.text', `${sum + 1}`)
}

function removeVote(column, cardIndex, sum) {
  cy.get(`[data-cy=group-column-${column}-body]`)
    .children()
    .eq(cardIndex)
    .find(`[data-cy=reflection-vote-row]`)
    .as('vote-card')

  cy.get('@vote-card')
    .find(`[data-cy=completed-vote-count]`)
    .should('exist')
    .should('have.text', `${sum}`)

  cy.get('@vote-card')
    .find(`[data-cy=remove-vote]`)
    .as('remove-vote')

  cy.get('@remove-vote').click()

  cy.get('@vote-card')
    .find(`[data-cy=completed-vote-count]`)
    .should('exist')
    .should('have.text', `${sum - 1}`)
}

describe('Test Vote page Demo', () => {
  before(function() {
    // runs before all tests in the block
    cy.visitReflect()
      .visitPhase('group')
      .visitPhase('vote')
  })

  it('Check that all personal votes are remaining and no team votes have been used', () => {
    cy.get(`[data-cy=my-votes-remaining]`).should('have.text', '5')
    cy.wait(3000)
    cy.get(`[data-cy=team-votes-remaining]`).should('have.text', '5')
  })

  it('Test voting on cards (ensure they can be voted on multiple times)', () => {
    addVote('Start', 0, 0)
    addVote('Stop', 0, 0)
    addVote('Continue', 0, 0)
  })

  it('Test voting limit on cards', () => {
    addVote('Start', 0, 1)
    addVote('Start', 0, 2)
  })

  it('Test removing votes from cards', () => {
    removeVote('Start', 0, 3)
    removeVote('Start', 0, 2)
    removeVote('Start', 0, 1)

    removeVote('Stop', 0, 1)

    removeVote('Continue', 0, 1)
  })

  it('Test emptying vote counter (should become zero when all votes are spent)', () => {
    addVote('Start', 0, 0)
    addVote('Start', 0, 1)
    addVote('Start', 0, 2)
    addVote('Stop', 0, 0)
    addVote('Continue', 0, 0)

    cy.get(`[data-cy=team-votes-remaining]`).should('have.text', '0')
  })

  it('Test advancing to discussions', () => {
    cy.visitPhase('discuss', '/1')
  })
})
