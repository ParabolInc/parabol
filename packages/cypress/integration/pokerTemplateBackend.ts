describe('Poker template related backend tests', () => {
  beforeEach(() => {
    cy.task('resetDb')
  })

  afterEach(() => {
    cy.task('resetDb')
  })

  const constructGraphQLQueryBody = (graphQLquery: string) => {
    return {
      type: 'start',
      payload: {
        query: graphQLquery
      }
    }
  }

  it('Creates a poker template', () => {
    const query = `
      mutation {
        addPokerTemplate(teamId: "h-CdSRCnT") {
          pokerTemplate {
            id
            name
            dimensions {
              name
              templateId
              scale {
                templateId
              }
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const pokerTemplate = responseData.addPokerTemplate.pokerTemplate
      assert.strictEqual('*New Template', pokerTemplate.name, 'Poker template name')
      const dimensions = pokerTemplate.dimensions
      assert.strictEqual(1, dimensions.length, 'Number of new dimension created')
      const dimension = dimensions[0]
      assert.strictEqual('*New Dimension', dimension.name, 'Dimension name')
      assert.strictEqual(pokerTemplate.id, dimension.templateId, "Dimension's templateId")
      const scale = dimension.scale
      assert.strictEqual(pokerTemplate.id, scale.templateId, "Scale's templateId")
    })
  })
})
