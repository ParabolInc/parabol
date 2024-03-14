// mostly borrowed from langchain
export class RecursiveCharacterTextSplitter {
  separators = ['\n\n', '\n', ' ', '']
  keepSeparator = true
  chunkSize: number
  chunkOverlap: number
  constructor({chunkSize, chunkOverlap}: {chunkSize: number; chunkOverlap: number}) {
    this.chunkSize = chunkSize
    this.chunkOverlap = chunkOverlap || 0
  }
  private splitOnSeparator(text: string, separator: string): string[] {
    let splits: string[] = []
    if (separator) {
      if (this.keepSeparator) {
        const regexEscapedSeparator = separator.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
        splits = text.split(new RegExp(`(?=${regexEscapedSeparator})`))
      } else {
        splits = text.split(separator)
      }
    } else {
      splits = text.split('')
    }
    return splits.filter((s) => s !== '')
  }

  private joinDocs(docs: string[], separator: string): string | null {
    const text = docs.join(separator).trim()
    return text === '' ? null : text
  }

  private mergeSplits(splits: string[], separator: string) {
    const docs: string[] = []
    const currentDoc: string[] = []
    let total = 0
    for (const d of splits) {
      const _len = d.length
      if (total + _len + (currentDoc.length > 0 ? separator.length : 0) > this.chunkSize) {
        if (total > this.chunkSize) {
          console.warn(
            `Created a chunk of size ${total}, +
which is longer than the specified ${this.chunkSize}`
          )
        }
        if (currentDoc.length > 0) {
          const doc = this.joinDocs(currentDoc, separator)
          if (doc !== null) {
            docs.push(doc)
          }
          // Keep on popping if:
          // - we have a larger chunk than in the chunk overlap
          // - or if we still have any chunks and the length is long
          while (total > this.chunkOverlap || (total + _len > this.chunkSize && total > 0)) {
            total -= currentDoc[0].length
            currentDoc.shift()
          }
        }
      }
      currentDoc.push(d)
      total += _len
    }
    const doc = this.joinDocs(currentDoc, separator)
    if (doc !== null) {
      docs.push(doc)
    }
    return docs
  }

  splitText(text: string) {
    const finalChunks: string[] = []
    const separators = this.separators

    // Get appropriate separator to use
    let separator: string = separators[separators.length - 1]
    let newSeparators: string[] | undefined
    for (let i = 0; i < separators.length; i += 1) {
      const s = separators[i]
      if (s === '') {
        separator = s
        break
      }
      if (text.includes(s)) {
        separator = s
        newSeparators = separators.slice(i + 1)
        break
      }
    }

    // Now that we have the separator, split the text
    const splits = this.splitOnSeparator(text, separator)

    // Now go merging things, recursively splitting longer texts.
    let goodSplits: string[] = []
    const _separator = this.keepSeparator ? '' : separator
    for (const s of splits) {
      if (s.length < this.chunkSize) {
        goodSplits.push(s)
      } else {
        if (goodSplits.length) {
          const mergedText = this.mergeSplits(goodSplits, _separator)
          finalChunks.push(...mergedText)
          goodSplits = []
        }
        if (!newSeparators) {
          finalChunks.push(s)
        } else {
          const otherInfo = this.splitText(s)
          finalChunks.push(...otherInfo)
        }
      }
    }
    if (goodSplits.length) {
      const mergedText = this.mergeSplits(goodSplits, _separator)
      finalChunks.push(...mergedText)
    }
    return finalChunks
  }
}
