/* eslint-env jest */
import getGroupMatrix from 'client/utils/autoGroup/getGroupMatrix'

describe('groupReflections', () => {
  test('handles an empty matrix', async () => {
    const matrix = []
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups).toEqual([])
  })
  test('handles a single value in the binary tree', async () => {
    const matrix = [[0, 1, 0]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups).toEqual([matrix])
  })
  test('handles 2 similar values in a binary tree', async () => {
    const matrix = [[0.4, 0.6, 0], [0.6, 0.4, 0]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups.length).toBe(1)
  })
  test('separates 2 pretty different values in a binary tree', async () => {
    const matrix = [[0.4, 0.6, 0], [0, 0, 1]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups.length).toBe(2)
  })
  test('separates 3 very different values in a binary tree', async () => {
    const matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups.length).toBe(3)
  })
  test('groups 2 similar, separates the rest', async () => {
    const matrix = [[1, 0, 0], [0.9, 0.1, 0], [0, 1, 0], [0, 0, 1]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups.length).toBe(3)
  })
  test('creates 2 groups of 2', async () => {
    const matrix = [[1, 0, 0], [0.7, 0.3, 0], [0.2, 0.2, 0.6], [0.25, 0.25, 0.5]]
    const {groups} = getGroupMatrix(matrix, 0.5)
    expect(groups.length).toBe(2)
  })
})
