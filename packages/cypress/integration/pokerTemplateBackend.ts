describe('Poker template related backend tests', () => {
  let pokerTemplate

  const constructGraphQLQueryBody = (graphQLquery: string) => {
    return {
      type: 'start',
      payload: {
        query: graphQLquery
      }
    }
  }

  const teamId = 'l6k4LyKnhP'

  beforeEach(() => {
    cy.task('resetDb')

    const query = `
      mutation {
        addPokerTemplate(teamId: \"${teamId}\") {
          pokerTemplate {
            id
            name
            dimensions {
              name
              templateId
              scale {
                id
              }
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      pokerTemplate = responseData.addPokerTemplate.pokerTemplate
    })
  })

  afterEach(() => {
    cy.task('resetDb')
  })

  it('Add a new poker template', () => {
    assert.strictEqual(pokerTemplate.name, '*New Template', 'Poker template name')
    const dimensions = pokerTemplate.dimensions
    assert.strictEqual(dimensions.length, 1, 'Number of new dimension created')
    const dimension = dimensions[0]
    assert.strictEqual(dimension.name, '*New Dimension', 'Dimension name')
    assert.strictEqual(dimension.scale.id, 'fibonacciScale', 'Dimension default scaleId')
    assert.strictEqual(dimension.templateId, pokerTemplate.id, "Dimension's templateId")
  })

  it('Renames a poker template', () => {
    const query = `
      mutation {
        renamePokerTemplate(templateId: "${pokerTemplate.id}", name: "Renamed") {
          pokerTemplate {
            id
            name
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newPokerTemplate = responseData.renamePokerTemplate.pokerTemplate
      assert.strictEqual(newPokerTemplate.id, pokerTemplate.id, 'Poker template id')
      assert.strictEqual(newPokerTemplate.name, 'Renamed', 'Poker template name')
    })
  })

  it('Removes a poker template', () => {
    const query = `
      mutation {
        removePokerTemplate(templateId: "${pokerTemplate.id}") {
          pokerTemplate {
            id
            isActive
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const removedPokerTemplate = responseData.removePokerTemplate.pokerTemplate
      assert.strictEqual(removedPokerTemplate.id, pokerTemplate.id, 'Poker template id')
      assert.strictEqual(removedPokerTemplate.isActive, false)
    })
  })

  it('Add a dimension', () => {
    const query = `
      mutation {
        addPokerTemplateDimension(templateId: "${pokerTemplate.id}") {
          dimension {
            templateId
            name
            isActive
            scale {
              id
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newDimension = responseData.addPokerTemplateDimension.dimension
      assert.strictEqual(
        pokerTemplate.id,
        newDimension.templateId,
        'Template id of the newly created dimension'
      )
      assert.strictEqual(newDimension.name, '*New Dimension #2', 'Dimension name')
      assert.strictEqual(newDimension.scale.id, 'fibonacciScale', "Dimension's defaultScaleId")
      assert.strictEqual(newDimension.isActive, true, 'IsActive of dimension')
    })
  })

  it('Add a new scale', () => {
    const query = `
      mutation {
        addPokerTemplateScale(teamId: \"${teamId}\") {
          scale {
            name
            isActive
            values {
              label
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newScale = responseData.addPokerTemplateScale.scale
      assert.strictEqual(newScale.name, '*New Scale #1', 'Scale name')
      assert.strictEqual(newScale.isActive, true, 'IsActive of scale')
      assert.strictEqual(
        newScale.values.length,
        0,
        'Values of the newly created scale should be empty'
      )
    })
  })

  it('Add a new scale value', () => {
    const addNewScaleQuery = `
      mutation {
        addPokerTemplateScale(teamId: \"${teamId}\") {
          scale {
            id
            name
            isActive
            values {
              label
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(addNewScaleQuery)).then((res) => {
      const responseData = res.body.payload.data
      const newScale = responseData.addPokerTemplateScale.scale
      const newScaleValue = {
        color: '#5CA0E5',
        value: 1,
        label: '1'
      }
      const addNewScaleValueQuery = `
        mutation($scaleValue: TemplateScaleInput!) {
          addPokerTemplateScaleValue(scaleId: "${newScale.id}", scaleValue: $scaleValue) {
            scale {
              values {
                label
                value
                color
              }
            }
          }
        }
      `
      const requestBody = {
        type: 'start',
        payload: {
          query: addNewScaleValueQuery,
          variables: {
            scaleValue: newScaleValue
          }
        }
      }
      cy.postGQL(requestBody).then((res) => {
        const responseData = res.body.payload.data
        const updatedScale = responseData.addPokerTemplateScaleValue.scale
        const updatedValues = updatedScale.values
        assert.strictEqual(updatedValues.length, 1, 'Number of values in the scale')
        const updatedValue = updatedValues[0]
        assert.strictEqual(updatedValue.color, '#5CA0E5', 'Color of the newly added scale value')
        assert.strictEqual(updatedValue.value, 1, 'Numerical value of the newly added scale value')
        assert.strictEqual(updatedValue.label, '1', 'Label of the newly added scale value')
      })
    })
  })
})
