import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useShop } from '../hooks/useShop'
import { formatPrice, quote } from '../lib/commerce'

export default function CartPage() {
  const { cart, products, promo, totals, setQuantity, removeFromCart, clearCart, applyPromo, clearPromo } = useShop()
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const [lineNote, setLineNote] = useState('')
  const priced = quote({ lines: cart, products, promo, delivery: null })
  const inBag = new Set(cart.map((line) => line.productId))
  const related = products.filter((product) => !inBag.has(product.id) && product.stock > 0).slice(0, 3)

  function changeQuantity(id, quantity) {
    const result = setQuantity(id, quantity)
    setLineNote(result.ok ? '' : result.error)
  }

  function onPromo(event) {
    event.preventDefault()
    const result = applyPromo(code)
    setNotice(result.ok ? `${result.promo.code} applied.` : result.error)
    if (result.ok) setCode('')
  }

  return (
    <div className="page">
      <h1>Your bag</h1>
      {priced.detailed.length === 0 ? (
        <div className="empty-state">
          <h3>Your bag is empty</h3>
          <p>Add a piece from the shop and it will stay here after a refresh.</p>
          <Link className="primary-button" to="/">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {priced.detailed.map((line) => (
              <article className="cart-line" key={line.id}>
                <img src={line.product.image} alt="" />
                <div>
                  <p className="product-category">{line.product.category}</p>
                  <h2>
                    <Link to={`/product/${line.productId}`}>{line.product.name}</Link>
                  </h2>
                  <p className="muted">
                    {[line.color, line.size].filter(Boolean).join(' · ') || 'One option'}
                  </p>
                  <div className="line-actions">
                    <div className="qty">
                      <button type="button" onClick={() => changeQuantity(line.id, line.quantity - 1)} aria-label="Decrease quantity">
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">
                        +
                      </button>
                    </div>
                    <button className="text-button" type="button" onClick={() => removeFromCart(line.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <strong>{formatPrice(line.lineTotal)}</strong>
              </article>
            ))}
            {lineNote && (
              <p className="alert alert-error" role="status">
                {lineNote}
              </p>
            )}
          </div>

          <aside className="summary">
            <h2>Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(priced.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{priced.discount > 0 ? `−${formatPrice(priced.discount)}` : formatPrice(0)}</span>
            </div>
            <p className="muted">Shipping is calculated at checkout.</p>
            {promo && priced.promoActive && (
              <p className="alert alert-success">
                {promo.code}: {promo.label}{' '}
                <button type="button" className="text-button" onClick={clearPromo}>
                  Remove
                </button>
              </p>
            )}
            {promo && !priced.promoActive && (
              <p className="alert alert-error">
                {promo.code} needs a larger subtotal.{' '}
                <button type="button" className="text-button" onClick={clearPromo}>
                  Remove
                </button>
              </p>
            )}
            <form className="promo-row" onSubmit={onPromo}>
              <label className="field">
                Discount code
                <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="WELCOME10" />
              </label>
              <button className="ghost-button" type="submit">
                Apply
              </button>
            </form>
            {notice && <p className="card-note">{notice}</p>}
            <div className="summary-row total">
              <span>Subtotal due now</span>
              <strong>{formatPrice(totals.subtotal - (priced.promoActive ? priced.discount : 0))}</strong>
            </div>
            <Link className="primary-button" to="/checkout">
              Checkout
            </Link>
            <button className="text-button" type="button" onClick={clearCart}>
              Clear bag
            </button>
          </aside>
        </div>
      )}

      {related.length > 0 && (
        <section className="related">
          <h2>You may also like</h2>
          <div className="product-grid">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
