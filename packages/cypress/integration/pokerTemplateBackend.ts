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
            }
            scales {
              id
              templateId
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
      assert.strictEqual('*New Scale #1', newScale.name, 'Scale name')
      assert.strictEqual(true, newScale.isActive, 'IsActive of scale')
      assert.strictEqual(
        0,
        newScale.values.length,
        'Values of the newly created scale should be empty'
      )
    })
  })

  it('Add a new poker template', () => {
    assert.strictEqual('*New Template', pokerTemplate.name, 'Poker template name')
    const dimensions = pokerTemplate.dimensions
    assert.strictEqual(1, dimensions.length, 'Number of new dimension created')
    const dimension = dimensions[0]
    assert.strictEqual('*New Dimension', dimension.name, 'Dimension name')
    assert.strictEqual(pokerTemplate.id, dimension.templateId, "Dimension's templateId")
    pokerTemplate.scales.forEach(({templateId}) =>
      assert.strictEqual(pokerTemplate.id, templateId, "Scale's templateId")
    )
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
      assert.strictEqual(pokerTemplate.id, newPokerTemplate.id, 'Poker template id')
      assert.strictEqual('Renamed', newPokerTemplate.name, 'Poker template name')
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
      assert.strictEqual(pokerTemplate.id, removedPokerTemplate.id, 'Poker template id')
      assert.strictEqual(false, removedPokerTemplate.isActive)
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
      assert.strictEqual('*New Dimension #2', newDimension.name, 'Dimension name')
      assert.strictEqual(true, newDimension.isActive, 'IsActive of dimension')
      const scaleIdsForTemplate = pokerTemplate.scales.map(({id}) => id)
      assert.isTrue(
        scaleIdsForTemplate.includes(newDimension.scale.id),
        'Scale of the newly created dimension should default to one exist in the template'
      )
    })
  })

  it('Add a new scale value', () => {
    const addNewScaleQuery = `
      mutation {
        addPokerTemplateScale(templateId: "${pokerTemplate.id}") {
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
          addPokerTemplateScaleValue(templateId: "${pokerTemplate.id}", scaleId: "${newScale.id}", scaleValue: $scaleValue) {
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
        assert.strictEqual(1, updatedValues.length, 'Number of values in the scale')
        const updatedValue = updatedValues[0]
        assert.strictEqual('ABC', updatedValue.color, 'Color of the newly added scale value')
        assert.strictEqual(1, updatedValue.value, 'Numerical value of the newly added scale value')
        assert.strictEqual('1', updatedValue.label, 'Label of the newly added scale value')
      })
    })
  })
})
