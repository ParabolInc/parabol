import {sign} from 'jsonwebtoken'
import fetch from 'node-fetch'
import sendToSentry from './utils/sendToSentry'

export interface SyntaxTextToken {
  content: string
  beginOffset: number
}

export interface GoogleAnalyzedSyntax {
  sentences: {
    text: SyntaxTextToken
  }[]
  tokens: {
    lemma: string
    text: SyntaxTextToken
    partOfSpeech: {
      tag: string
      aspect: string
      case: string
      form: string
      gender: string
      mood: string
      number: string
      person: string
      proper: string
      reciprocity: string
      tense: string
      voice: string
    }
    dependencyEdge: {
      label: string
      headTokenIndex: number
    }
  }[]
}

export interface GoogleAnalyzedEntities {
  entities: {
    name: string
    salience: number // 0 - 1
  }[]
  language: string
}

export interface GoogleAnalyzedSentiment {
  documentSentiment: {
    magnitude: number
    score: number
  }
  language: string
  sentences: {
    text: {
      content: string
      beginOffSet: number
    }
    sentiment: {
      magnitude: number
      score: number
    }
  }[]
}

interface GoogleError {
  code: number
  message: string
  status: string
}

interface CloudKey {
  clientEmail: string
  privateKeyId: string
  privateKey: string
}

export type GoogleErrorResponse = {
  error: GoogleError
}

export type GoogleLanguageResponse =
  | GoogleAnalyzedSyntax
  | GoogleAnalyzedEntities
  | GoogleAnalyzedSentiment

const MAX_REQUEST_TIME = 10000

export default class GoogleLanguageManager {
  static GOOGLE_EXPIRY = 3600
  jwt: string | undefined
  cloudKey: CloudKey
  constructor(cloudKey: CloudKey) {
    this.cloudKey = cloudKey
    const timeout = (GoogleLanguageManager.GOOGLE_EXPIRY - 100) * 1000
    this.refreshJWT()
    setInterval(() => {
      this.refreshJWT()
    }, timeout)
  }

  refreshJWT() {
    const {clientEmail, privateKeyId, privateKey} = this.cloudKey
    try {
      this.jwt = sign({}, privateKey, {
        algorithm: 'RS256',
        audience: 'https://language.googleapis.com/',
        subject: clientEmail,
        issuer: clientEmail,
        keyid: privateKeyId,
        expiresIn: GoogleLanguageManager.GOOGLE_EXPIRY
      })
    } catch (e) {
      this.jwt = undefined
    }
  }

  async post<T>(endpoint: string, content: string): Promise<T> {
    if (!this.jwt) {
      return {
        error: {
          code: 500,
          message: 'No JWT provided',
          status: 'GOOGLE_CLOUD_PRIVATE_KEY is invalid in the .env'
        }
      } as any
    }
    const controller = new AbortController()
    const {signal} = controller as any
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await fetch(`https://language.googleapis.com/v1/${endpoint}`, {
        signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.jwt}`,
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content
          }
        })
      })
      clearTimeout(timeout)
      return res.json()
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to fetch google language apis')
      sendToSentry(error)
      clearTimeout(timeout)
      return {
        error: {
          code: 500,
          message: error.message,
          status: 'Google is down'
        }
      } as any
    }
  }

  analyzeEntities(content: string) {
    return this.post<GoogleAnalyzedEntities | GoogleErrorResponse>(
      'documents:analyzeEntities',
      content
    )
  }

  analyzeSyntax(content: string) {
    return this.post<GoogleAnalyzedSyntax | GoogleErrorResponse>('documents:analyzeSyntax', content)
  }

  analyzeSentiment(content: string) {
    return this.post<GoogleAnalyzedSentiment | GoogleErrorResponse>(
      'documents:analyzeSentiment',
      content
    )
  }
}
