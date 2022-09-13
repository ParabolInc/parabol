const getWordAt = (str: string, pos: number, willBreakAfterAnchor?: boolean) => {
  // find the last nonwhitespace char before the position. if str ends in a space, this is -1
  const left = str.slice(0, pos + 1).search(/\S+$/)

  if (left === -1) {
    return {
      word: '',
      begin: pos,
      end: pos
    }
  }
  // if i move to the beginning of a word & then type a url, when i hit space, i want it to end where the space WILL be
  const right = willBreakAfterAnchor ? 1 : str.slice(pos).search(/\s/)
  // The last word in the string is a special case.
  if (right < 0) {
    return {
      word: str.slice(left),
      begin: left,
      end: str.length
    }
  }

  // Return the word, using the located bounds to extract it from the string.
  return {
    word: str.slice(left, right + pos),
    begin: left,
    end: right + pos
  }
}

export default getWordAt
