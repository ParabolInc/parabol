import {readFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'

const LINES_PER_CHECKPOINT = 64
const COMMA = 44
const SEMICOLON = 59
const BASE64_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const base64DigitByCharCode = new Uint8Array(128)
for (let digit = 0; digit < BASE64_DIGITS.length; digit++) {
  base64DigitByCharCode[BASE64_DIGITS.charCodeAt(digit)] = digit
}

interface RawSourceMap {
  mappings: string
  sources: string[]
  names?: string[]
  sourceRoot?: string
}

export interface OriginalPosition {
  source: string
  line: number
  column: number
  name: string | undefined
}

// node's own SourceMap decodes every mapping into an array & keeps them all, which is ~180MB of heap for web.js.map
// This keeps the encoded mappings & the decoder's state at every 64th generated line, then decodes the few lines a lookup needs
export default class CompactSourceMap {
  private readonly mappings: Buffer
  private readonly sources: string[]
  private readonly names: string[]
  private readonly checkpointOffsets: Uint32Array
  private readonly checkpointStates: Int32Array
  private cursor = 0
  private generatedColumn = 0
  private sourceIndex = 0
  private originalLine = 0
  private originalColumn = 0
  private nameIndex = 0
  private hasSource = false
  private hasName = false

  constructor(mapPath: string) {
    const {mappings, sources, names, sourceRoot} = JSON.parse(
      readFileSync(mapPath, 'utf8')
    ) as RawSourceMap
    const mapURL = pathToFileURL(mapPath)
    this.mappings = Buffer.from(mappings, 'latin1')
    this.sources = sources.map((source) => new URL((sourceRoot ?? '') + source, mapURL).href)
    this.names = names ?? []
    const checkpointOffsets = [0]
    const checkpointStates = [0, 0, 0, 0]
    let generatedLine = 0
    while (this.cursor < this.mappings.length) {
      const charCode = this.mappings[this.cursor]
      if (charCode === SEMICOLON) {
        this.cursor++
        generatedLine++
        if (generatedLine % LINES_PER_CHECKPOINT === 0) {
          checkpointOffsets.push(this.cursor)
          checkpointStates.push(
            this.sourceIndex,
            this.originalLine,
            this.originalColumn,
            this.nameIndex
          )
        }
      } else if (charCode === COMMA) {
        this.cursor++
      } else {
        this.readSegment()
      }
    }
    this.checkpointOffsets = Uint32Array.from(checkpointOffsets)
    this.checkpointStates = Int32Array.from(checkpointStates)
  }

  private readVLQ() {
    let value = 0
    let shift = 0
    let digit: number
    do {
      digit = base64DigitByCharCode[this.mappings[this.cursor++]!]!
      value |= (digit & 31) << shift
      shift += 5
    } while (digit & 32)
    return value & 1 ? -(value >>> 1) : value >>> 1
  }

  private isAtSeparator() {
    const charCode = this.mappings[this.cursor]
    return charCode === undefined || charCode === COMMA || charCode === SEMICOLON
  }

  private readSegment() {
    this.generatedColumn += this.readVLQ()
    this.hasSource = !this.isAtSeparator()
    if (!this.hasSource) return
    this.sourceIndex += this.readVLQ()
    this.originalLine += this.readVLQ()
    this.originalColumn += this.readVLQ()
    this.hasName = !this.isAtSeparator()
    if (this.hasName) this.nameIndex += this.readVLQ()
  }

  // The last mapping at or before a 0-based generated position, the same one node's SourceMap#findEntry picks
  findOriginalPosition(generatedLine: number, generatedColumn: number): OriginalPosition | null {
    const {mappings, checkpointOffsets, checkpointStates} = this
    const lastCheckpoint = checkpointOffsets.length - 1
    const firstCheckpoint = Math.min(
      Math.floor(generatedLine / LINES_PER_CHECKPOINT),
      lastCheckpoint
    )
    let targetLine = generatedLine
    let targetColumn = generatedColumn
    for (let checkpoint = firstCheckpoint; checkpoint >= 0; checkpoint--) {
      const blockEnd =
        checkpoint < lastCheckpoint ? checkpointOffsets[checkpoint + 1]! : mappings.length
      this.cursor = checkpointOffsets[checkpoint]!
      this.generatedColumn = 0
      this.sourceIndex = checkpointStates[checkpoint * 4]!
      this.originalLine = checkpointStates[checkpoint * 4 + 1]!
      this.originalColumn = checkpointStates[checkpoint * 4 + 2]!
      this.nameIndex = checkpointStates[checkpoint * 4 + 3]!
      let line = checkpoint * LINES_PER_CHECKPOINT
      let isFound = false
      let source: string | undefined
      let originalLine = 0
      let originalColumn = 0
      let name: string | undefined
      while (this.cursor < blockEnd) {
        const charCode = mappings[this.cursor]
        if (charCode === SEMICOLON) {
          this.cursor++
          line++
          this.generatedColumn = 0
          if (line > targetLine) break
        } else if (charCode === COMMA) {
          this.cursor++
        } else {
          this.readSegment()
          if (line === targetLine && this.generatedColumn > targetColumn) break
          isFound = true
          source = this.hasSource ? this.sources[this.sourceIndex] : undefined
          originalLine = this.originalLine
          originalColumn = this.originalColumn
          name = this.hasSource && this.hasName ? this.names[this.nameIndex] : undefined
        }
      }
      if (isFound) {
        return source === undefined
          ? null
          : {source, line: originalLine, column: originalColumn, name}
      }
      // nothing in this block is at or before the position, so it falls in the last mapping of an earlier block
      targetLine = Infinity
      targetColumn = Infinity
    }
    return null
  }
}
