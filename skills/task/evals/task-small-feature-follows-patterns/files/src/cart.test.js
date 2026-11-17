import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lineTotal, subtotal, cartTotal } from './cart.js'

const items = [
  { sku: 'A', priceCents: 1000, qty: 2 },
  { sku: 'B', priceCents: 550, qty: 1 },
]

test('lineTotal multiplies price by quantity', () => {
  assert.equal(lineTotal(items[0]), 2000)
})

test('subtotal adds every line', () => {
  assert.equal(subtotal(items), 2550)
})

test('cartTotal with no discount is the subtotal', () => {
  assert.equal(cartTotal(items), 2550)
})
