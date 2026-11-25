import getRedis from '../utils/getRedis'
import {
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  signUpWithoutAI
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const COPY_SCALE = `
  mutation CopyScale($parentScaleId: ID!, $teamId: ID!) {
    addPokerTemplateScale(parentScaleId: $parentScaleId, teamId: $teamId) {
      scale {
        id
        values {
          label
          color
        }
      }
    }
  }
`

const UPDATE_SCALE_VALUE = `
  mutation UpdateScaleValue(
    $scaleId: ID!
    $oldScaleValue: TemplateScaleInput!
    $newScaleValue: TemplateScaleInput!
  ) {
    updatePokerTemplateScaleValue(
      scaleId: $scaleId
      oldScaleValue: $oldScaleValue
      newScaleValue: $newScaleValue
    ) {
      scale {
        values {
          label
          color
        }
      }
    }
  }
`

test('a value on a copy of a built-in scale can be renamed and keep its colour, but not take another colour off the palette', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['TEMPLATES_WRITE'], {cookie})
  const copied = await callToolForData(token, 'graphql_mutate', {
    query: COPY_SCALE,
    variables: {parentScaleId: 'tshirtSizeScale', teamId}
  })
  const {id: scaleId, values} = copied.addPokerTemplateScale.scale
  const extraSmall = values.find(({label}: {label: string}) => label === 'XS')
  expect(extraSmall).toEqual({label: 'XS', color: '#5CA0E5'})

  const renamed = await callToolForData(token, 'graphql_mutate', {
    query: UPDATE_SCALE_VALUE,
    variables: {
      scaleId,
      oldScaleValue: extraSmall,
      newScaleValue: {label: 'XXS', color: '#5ca0e5'}
    }
  })
  expect(renamed.updatePokerTemplateScaleValue.scale.values[0]).toEqual({
    label: 'XXS',
    color: '#5CA0E5'
  })

  const recoloured = await callTool(token, 'graphql_mutate', {
    query: UPDATE_SCALE_VALUE,
    variables: {
      scaleId,
      oldScaleValue: {label: 'XXS', color: '#5CA0E5'},
      newScaleValue: {label: 'XXS', color: '#45E595'}
    }
  })
  expect(expectToolErrorCode(recoloured, 'BAD_USER_INPUT')).toBe('Invalid scale color')
})
