// https://www.figma.com/blog/realtime-editing-of-ordered-sequences/#fractional-indexing/
// https://steve.dignam.xyz/2020/03/31/practical-ordering/
// Creates a sortOrder that is a string of characters that can be compared lexicographically
// This is beneficial because each change results in 1 update to the DB & there is no rebalancing necessary
// WARNING: the lexicographical sort assumes a C collation (i.e. compare strings via ASCII code)
// CloudSQL assumes a utf-8 (byte-code) comparision by default, so make sure the column is collated correctly!

import {MaybeReadonly} from '../types/generics'

const START_CHAR_CODE = 32
const END_CHAR_CODE = 126

export function positionBefore(pos: string) {
  for (let i = pos.length - 1; i >= 0; i--) {
    const curCharCode = pos.charCodeAt(i)
    if (curCharCode > START_CHAR_CODE + 1) {
      return pos.substr(0, i) + String.fromCharCode(curCharCode - 1)
    }
  }
  return (
    pos.substr(0, pos.length - 1) +
    String.fromCharCode(START_CHAR_CODE) +
    String.fromCharCode(END_CHAR_CODE)
  )
}
export function positionAfter(pos: string) {
  for (let i = pos.length - 1; i >= 0; i--) {
    const curCharCode = pos.charCodeAt(i)
    if (curCharCode < END_CHAR_CODE) {
      return pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
    }
  }
  return pos + String.fromCharCode(START_CHAR_CODE + 1)
}

function avg(a: number, b: number) {
  return Math.trunc((a + b) / 2)
}

function positionBetween(firstPos: string, secondPos: string) {
  let flag = false
  let position = ''
  const maxLength = Math.max(firstPos.length, secondPos.length)
  for (let i = 0; i < maxLength; i++) {
    const lower = i < firstPos.length ? firstPos.charCodeAt(i) : START_CHAR_CODE
    const upper = i < secondPos.length && !flag ? secondPos.charCodeAt(i) : END_CHAR_CODE
    if (lower === upper) {
      position += String.fromCharCode(lower)
    } else if (upper - lower > 1) {
      position += String.fromCharCode(avg(lower, upper))
      flag = false
      break
    } else {
      position += String.fromCharCode(lower)
      flag = true
    }
  }
  if (!flag) return position
  return position + String.fromCharCode(avg(START_CHAR_CODE, END_CHAR_CODE))
}

export function getSortOrder(
  arr: MaybeReadonly<{sortOrder: string}[]>,
  fromIdx: number,
  toIdx: number
) {
  const secondPosIdx = fromIdx < toIdx ? toIdx + 1 : toIdx
  const firstPos = arr[secondPosIdx - 1]?.sortOrder
  const secondPos = arr[secondPosIdx]?.sortOrder
  if (firstPos && secondPos) return positionBetween(firstPos, secondPos)
  if (secondPos) return positionBefore(secondPos)
  return positionAfter(firstPos || '')
}
