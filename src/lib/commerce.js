export const formatPrice = (price) => `$${Number(price).toFixed(2)}`

export const money = (value) => Math.round(Number(value) * 100) / 100

export function isOnSale(product) {
  return product.salePrice != null && product.salePrice < product.price
}

export function unitPrice(product) {
  return isOnSale(product) ? product.salePrice : product.price
}

export function lineId(productId, size = '', color = '') {
  return `${productId}:${size}:${color}`
}

export function averageRating(product) {
  const reviews = product.reviews ?? []
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return total / reviews.length
}

export function stockLabel(stock) {
  if (stock <= 0) return 'Out of stock'
  if (stock <= 5) return `Only ${stock} left`
  return 'In stock'
}

export function promoApplies(promo, subtotal) {
  if (!promo) return false
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return false
  return true
}

export function quote({ lines, products, promo, delivery }) {
  const detailed = lines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId)
      if (!product) return null
      const price = unitPrice(product)
      return {
        ...line,
        product,
        unitPrice: price,
        lineTotal: money(price * line.quantity),
      }
    })
    .filter(Boolean)

  const subtotal = money(detailed.reduce((sum, line) => sum + line.lineTotal, 0))
  const promoActive = promoApplies(promo, subtotal)
  let discount = 0
  let shipping = delivery ? delivery.price : 0

  if (promoActive && promo.type === 'percent') discount = subtotal * (promo.amount / 100)
  if (promoActive && promo.type === 'fixed') discount = Math.min(promo.amount, subtotal)
  if (promoActive && promo.type === 'shipping' && delivery?.id === 'standard') shipping = 0
  if (delivery?.id === 'pickup') shipping = 0

  discount = money(discount)
  shipping = money(shipping)
  const total = money(Math.max(0, subtotal - discount + shipping))

  return { detailed, subtotal, discount, shipping, total, promoActive }
}

export function reservedQuantity(lines, productId, exceptId) {
  return lines
    .filter((line) => line.productId === productId && line.id !== exceptId)
    .reduce((sum, line) => sum + line.quantity, 0)
}

export const STATUS_LABELS = {
  placed: 'Order placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  return_requested: 'Return requested',
  returned: 'Returned',
}
