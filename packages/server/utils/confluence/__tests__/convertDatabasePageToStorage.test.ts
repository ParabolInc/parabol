import * as Y from 'yjs'
import {convertDatabasePageToStorage} from '../convertDatabasePageToStorage'

const buildDatabaseDoc = () => {
  const doc = new Y.Doc()
  doc.transact(() => {
    doc.getArray<string>('columns').push(['c1', 'c2', 'c3'])
    const meta = doc.getMap('columnMeta')
    meta.set('c1', {name: 'Task', type: 'text'})
    meta.set('c2', {name: 'Done?', type: 'check'})
    meta.set('c3', {name: 'Status', type: 'status'})
    doc.getArray<string>('rows').push(['r1', 'r2'])
    const data = doc.getMap('data')
    data.set(
      'r1',
      Y.Array.from([
        {key: 'c1', val: 'Ship & test'},
        {key: 'c2', val: 'true'},
        {key: 'c3', val: 'On track'}
      ])
    )
    // legacy row shape (Y.Map) must be readable WITHOUT mutating the doc
    const legacy = new Y.Map<string>()
    data.set('r2', legacy)
    legacy.set('c1', 'Write docs')
    legacy.set('c2', 'false')
  })
  return doc
}

const ctx = {
  parabolPageUrl: 'https://dev.parabol.co/pages/db-42',
  appOrigin: 'https://dev.parabol.co',
  snapshotDate: 'Jul 27, 2026',
  pageTitle: 'Sprint Tracker'
}

describe('convertDatabasePageToStorage', () => {
  it('renders a static table with header note, check marks, and status lozenges', () => {
    const {title, xhtml, degraded} = convertDatabasePageToStorage(buildDatabaseDoc(), ctx)
    expect(title).toBe('Sprint Tracker')
    expect(xhtml).toContain('Snapshot from Parabol · Jul 27, 2026')
    expect(xhtml).toContain('<th>Task</th><th>Done?</th><th>Status</th>')
    expect(xhtml).toContain('<td>Ship &amp; test</td><td>✓</td>')
    expect(xhtml).toContain('<ac:parameter ac:name="title">On track</ac:parameter>')
    expect(xhtml).toContain('<td>Write docs</td><td>—</td><td></td>')
    expect(xhtml).toContain('Exported from Parabol')
    expect(degraded).toEqual([
      {blockType: 'database', count: 1, treatment: 'exported as a static table snapshot'}
    ])
  })

  it('does not mutate legacy Y.Map rows while reading', () => {
    const doc = buildDatabaseDoc()
    convertDatabasePageToStorage(doc, ctx)
    expect(doc.getMap('data').get('r2')).toBeInstanceOf(Y.Map)
  })
})
