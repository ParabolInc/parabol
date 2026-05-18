import nextMetaField from '../nextMetaField'

describe('nextMetaField', () => {
  describe('when retroDiscussion is available (3-state cycle)', () => {
    it('rotates createdAt -> updatedAt', () => {
      expect(nextMetaField('createdAt', true)).toBe('updatedAt')
    })
    it('rotates updatedAt -> createdIn', () => {
      expect(nextMetaField('updatedAt', true)).toBe('createdIn')
    })
    it('rotates createdIn -> createdAt', () => {
      expect(nextMetaField('createdIn', true)).toBe('createdAt')
    })
  })

  describe('when retroDiscussion is absent (2-state cycle)', () => {
    it('rotates createdAt -> updatedAt', () => {
      expect(nextMetaField('createdAt', false)).toBe('updatedAt')
    })
    it('rotates updatedAt -> createdAt', () => {
      expect(nextMetaField('updatedAt', false)).toBe('createdAt')
    })
    it('treats createdIn as if it were updatedAt (recovery path) and returns createdAt', () => {
      expect(nextMetaField('createdIn', false)).toBe('createdAt')
    })
  })
})
