// Prices are integer cents. Discounts are whole percents (10 = 10% off).

export function lineTotal(item) {
  return item.priceCents * item.qty
}

export function subtotal(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

export function cartTotal(items, discountPercent = 0) {
  const sub = subtotal(items)
  return sub - Math.round(sub * discountPercent)
}
