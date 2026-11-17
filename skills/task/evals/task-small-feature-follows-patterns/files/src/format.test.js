import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatCents } from './format.js'

test('formatCents shows dollars with two decimals', () => {
  assert.equal(formatCents(2550), '$25.50')
})
