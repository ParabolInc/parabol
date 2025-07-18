import {
  HocuspocusProvider,
  HocuspocusProviderConfiguration,
  HocuspocusProviderWebsocket
} from '@hocuspocus/provider'
import * as Y from 'yjs'


// UUID generator
const getRandom = crypto.getRandomValues.bind(crypto)
const uuidTemplate = ([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11
const generateUUID = (): string =>
  uuidTemplate.replace(/[018]/g, (c: string) =>
    (+c ^ (getRandom(new Uint32Array(1))[0]! & (15 >> (+c / 4)))).toString(16)
  )


export type TiptapCollabProviderConfiguration = Required<
  Pick<HocuspocusProviderConfiguration, 'name'>
> &
  Partial<HocuspocusProviderConfiguration> &
  (
    | Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'websocketProvider'>>
    | Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'appId'>>
    | Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'baseUrl'>>
  ) &
  Pick<AdditionalTiptapCollabProviderConfiguration, 'user'> & {
    /**
     * Pass `true` if you want to delete a thread when the first comment is deleted.
     */
    deleteThreadOnFirstCommentDelete?: boolean
  }
export interface AdditionalTiptapCollabProviderConfiguration {
  appId?: string
  baseUrl?: string
  websocketProvider?: HocuspocusProviderWebsocket
  user?: string
}

const defaultDeleteCommentOptions = {
  deleteContent: false,
  deleteThread: false
}

const defaultThreadFilter = {
  types: ['unarchived']
}

const defaultDeleteThreadOptions = {
  deleteComments: false,
  force: false
}

class TiptapCollabProvider extends HocuspocusProvider {
  tiptapCollabConfigurationPrefix = '__tiptapcollab__'
  userData?: Y.PermanentUserData
  manageSocket = false

  constructor(options: HocuspocusProviderConfiguration) {
    if (!options.token) {
      options.token = 'notoken'
    }
    super(options)
  }

  createVersion(name: string) {
    return this.sendStateless(JSON.stringify({action: 'version.create', name}))
  }

  revertToVersion(version: string, fields: string[] = ['default']) {
    return this.sendStateless(JSON.stringify({action: 'document.revert', version, fields}))
  }

  previewVersion(version: string) {
    return this.sendStateless(JSON.stringify({action: 'version.preview', version}))
  }

  getVersions(): any[] {
    return this.configuration.document
      .getArray(`${this.tiptapCollabConfigurationPrefix}versions`)
      .toArray()
  }

  watchVersions(callback: (event: Y.YArrayEvent<any>, transaction: Y.Transaction) => void) {
    return this.configuration.document.getArray('__tiptapcollab__versions').observe(callback)
  }

  unwatchVersions(callback: (event: Y.YArrayEvent<any>, transaction: Y.Transaction) => void) {
    return this.configuration.document.getArray('__tiptapcollab__versions').unobserve(callback)
  }

  isAutoVersioning(): boolean {
    return !!this.configuration.document
      .getMap(`${this.tiptapCollabConfigurationPrefix}config`)
      .get('autoVersioning')
  }

  enableAutoVersioning() {
    return this.configuration.document
      .getMap(`${this.tiptapCollabConfigurationPrefix}config`)
      .set('autoVersioning', 1)
  }

  disableAutoVersioning() {
    return this.configuration.document
      .getMap(`${this.tiptapCollabConfigurationPrefix}config`)
      .set('autoVersioning', 0)
  }

  getYThreads(): Y.Array<Y.Map<any>> {
    return this.configuration.document.getArray(`${this.tiptapCollabConfigurationPrefix}threads`)
  }

  getThreads(filter?: {types?: string[]}): any[] {
    const {types} = {...defaultThreadFilter, ...filter}
    const threads = this.getYThreads().toJSON()

    if (!types?.includes('archived') || !types?.includes('unarchived')) {
      return threads.filter(
        (t: any) =>
          (!types?.includes('archived') || !t.deletedAt) &&
          (!types?.includes('unarchived') || t.deletedAt)
      )
    }

    return threads
  }

  getThreadIndex(threadId: string): number | null {
    const threads = this.getThreads({types: ['archived', 'unarchived']})
    for (let i = 0; i < threads.length; i++) {
      if (threads[i].id === threadId) return i
    }
    return null
  }

  getThread(threadId: string): any | null {
    const index = this.getThreadIndex(threadId)
    return index === null ? null : this.getYThreads().get(index)?.toJSON()
  }

  getYThread(threadId: string): Y.Map<any> | null {
    const index = this.getThreadIndex(threadId)
    return index === null ? null : this.getYThreads().get(index)
  }

  createThread(data: Record<string, any>) {
    let result = {}
    this.document.transact(() => {
      const thread = new Y.Map()
      thread.set('id', generateUUID())
      thread.set('createdAt', new Date().toISOString())
      thread.set('comments', new Y.Array())
      thread.set('deletedComments', new Y.Array())
      thread.set('deletedAt', null)
      this.getYThreads().push([thread])
      result = this.updateThread(String(thread.get('id')), data)
    })
    return result
  }

  updateThread(threadId: string, data: Record<string, any>) {
    let result = {}
    this.document.transact(() => {
      const thread = this.getYThread(threadId)
      if (!thread) return
      thread.set('updatedAt', new Date().toISOString())
      if (data.data) thread.set('data', data.data)
      if ('resolvedAt' in data) thread.set('resolvedAt', data.resolvedAt)
      result = thread.toJSON()
    })
    return result
  }

  deleteThread(threadId: string, options?: {deleteComments?: boolean; force?: boolean}) {
    const {deleteComments, force} = {...defaultDeleteThreadOptions, ...options}
    const index = this.getThreadIndex(threadId)
    if (index === null) return null

    if (force) {
      this.getYThreads().delete(index, 1)
      return
    }

    const thread = this.getYThreads().get(index)
    thread.set('deletedAt', new Date().toISOString())
    if (deleteComments) {
      thread.set('comments', new Y.Array())
      thread.set('deletedComments', new Y.Array())
    }
    return thread.toJSON()
  }

  restoreThread(threadId: string) {
    const index = this.getThreadIndex(threadId)
    if (index === null) return null
    const thread = this.getYThreads().get(index)
    thread.set('deletedAt', null)
    return thread.toJSON()
  }

  getThreadComments(threadId: string, includeDeleted = false): any[] {
    if (this.getThreadIndex(threadId) === null) return []
    const thread = this.getThread(threadId)
    if (!thread) return []

    if (includeDeleted) {
      return [...(thread.comments ?? []), ...(thread.deletedComments ?? [])].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      )
    }

    return thread.comments ?? []
  }

  getThreadComment(threadId: string, commentId: string, includeDeleted = false): any | null {
    const comments = this.getThreadComments(threadId, includeDeleted)
    return comments.find((comment: any) => comment.id === commentId) ?? null
  }

  addComment(threadId: string, data: Record<string, any>) {
    let result = {}
    this.document.transact(() => {
      const thread = this.getYThread(threadId)
      if (!thread) return
      const comment = new Y.Map()
      comment.set('id', generateUUID())
      comment.set('createdAt', new Date().toISOString())
      thread.get('comments').push([comment])
      result = this.updateComment(threadId, String(comment.get('id')), data)
    })
    return result
  }

  updateComment(threadId: string, commentId: string, data: Record<string, any>) {
    let result = {}
    this.document.transact(() => {
      const thread = this.getYThread(threadId)
      if (!thread) return
      const comments: Y.Map<any>[] = thread.get('comments')
      const comment = comments.find((c) => c.get('id') === commentId)
      if (!comment) return
      comment.set('updatedAt', new Date().toISOString())
      if (data.data) comment.set('data', data.data)
      if (data.content) comment.set('content', data.content)
      result = thread.toJSON()
    })
    return result
  }

  deleteComment(
    threadId: string,
    commentId: string,
    options?: {deleteContent?: boolean; deleteThread?: boolean}
  ) {
    const {deleteContent, deleteThread} = {...defaultDeleteCommentOptions, ...options}
    const thread = this.getYThread(threadId)
    if (!thread) return null

    const comments: Y.Map<any>[] = thread.get('comments')
    const index = comments.findIndex((c) => c.get('id') === commentId)
    if (index === -1) return null

    if (
      index === 0 &&
      (deleteThread || (this.configuration as any).deleteThreadOnFirstCommentDelete)
    ) {
      this.deleteThread(threadId)
      return
    }

    const comment = comments[index]!
    const deleted = new Y.Map()
    deleted.set('id', comment.get('id'))
    deleted.set('createdAt', comment.get('createdAt'))
    deleted.set('updatedAt', new Date().toISOString())
    deleted.set('deletedAt', new Date().toISOString())
    deleted.set('data', comment.get('data'))
    deleted.set('content', deleteContent ? null : comment.get('content'))

    thread.get('deletedComments').push([deleted])
    thread.get('comments').delete(index)
    return thread.toJSON()
  }

  watchThreads(callback: (...args: any[]) => void) {
    this.getYThreads().observeDeep(callback)
  }

  unwatchThreads(callback: (...args: any[]) => void) {
    this.getYThreads().unobserveDeep(callback)
  }
}

export default TiptapCollabProvider
export {TiptapCollabProvider}
