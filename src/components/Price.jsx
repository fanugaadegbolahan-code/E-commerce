export function Stars({ value }) {
  const rounded = Math.round(value)
  const label = Number.isInteger(value) ? `${value} out of 5` : `${value.toFixed(1)} out of 5`

  return (
    <span className="stars" aria-label={label}>
      {'★★★★★'.slice(0, rounded)}
      <span aria-hidden="true">{'★★★★★'.slice(rounded)}</span>
    </span>
  )
}

export function Price({ product }) {
  const onSale = product.salePrice != null && product.salePrice < product.price
  const current = onSale ? product.salePrice : product.price

  return (
    <span className="price">
      {onSale && <s>${product.price.toFixed(2)}</s>}
      <strong>${current.toFixed(2)}</strong>
    </span>
  )
}
