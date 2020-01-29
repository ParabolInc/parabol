import {sign} from 'jsonwebtoken'
import fetch from 'node-fetch'
import sendToSentry from './utils/sendToSentry'

interface SyntaxTextToken {
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

interface GoogleError {
  code: number
  message: string
  status: string
}

interface CloudKey {
  client_email: string
  private_key_id: string
  private_key: string
}

export type GoogleErrorResponse = [
  {
    error: GoogleError
  }
]

export default class GoogleLanguageManager {
  static GOOGLE_EXPIRY = 3600
  jwt!: string
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
    const {client_email, private_key_id, private_key} = this.cloudKey
    this.jwt = sign({}, private_key, {
      algorithm: 'RS256',
      audience: 'https://language.googleapis.com/',
      subject: client_email,
      issuer: client_email,
      keyid: private_key_id,
      expiresIn: GoogleLanguageManager.GOOGLE_EXPIRY
    })
  }
  async post<T>(endpoint: string, content: string): Promise<T> {
    const res = await fetch(`https://language.googleapis.com/v1/${endpoint}`, {
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
    }).catch((e: Error) => {
      sendToSentry(e)
      return {
        code: 500,
        message: e.message,
        status: 'Google is down'
      }
    })
    const resJSON = await res.json()
    return resJSON
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
}
