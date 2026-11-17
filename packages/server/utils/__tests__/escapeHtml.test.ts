import {escapeHtml} from '../escapeHtml'

test('escapes the five markup-significant characters', () => {
  expect(escapeHtml(`<script>alert("x" & 'y')</script>`)).toBe(
    '&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;'
  )
})

test('escapes the ampersand first so entities are not double-escaped away', () => {
  expect(escapeHtml('&lt;')).toBe('&amp;lt;')
})

test('leaves safe text untouched', () => {
  expect(escapeHtml('Matt: 3 items ✅')).toBe('Matt: 3 items ✅')
})
