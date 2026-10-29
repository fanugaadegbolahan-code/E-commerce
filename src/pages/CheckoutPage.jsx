import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deliveryMethods } from '../data/catalog'
import { useShop } from '../hooks/useShop'
import { formatPrice, quote } from '../lib/commerce'

const emptyAddress = {
  id: '',
  fullName: '',
  line1: '',
  city: '',
  region: '',
  postal: '',
  country: 'United States',
  phone: '',
}

const steps = ['Address', 'Delivery', 'Payment', 'Review']

export default function CheckoutPage() {
  const { cart, products, promo, user, placeOrder } = useShop()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [placed, setPlaced] = useState(false)
  const [saveAddress, setSaveAddress] = useState(Boolean(user))
  const [contact, setContact] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [address, setAddress] = useState(user?.addresses[0] ? { ...user.addresses[0] } : emptyAddress)
  const [deliveryId, setDeliveryId] = useState('standard')
  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    wallet: 'PayPal',
  })

  const delivery = deliveryMethods.find((item) => item.id === deliveryId) ?? deliveryMethods[0]
  const priced = quote({ lines: cart, products, promo, delivery })

  if (placed) return null

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <div className="empty-state">
          <h3>Your bag is empty</h3>
          <Link className="primary-button" to="/">
            Return to the shop
          </Link>
        </div>
      </div>
    )
  }

  function patchAddress(key, value) {
    setAddress((current) => ({ ...current, id: key === 'id' ? value : '', [key]: value }))
  }

  function addressReady() {
    if (!contact.name.trim() || !contact.email.includes('@')) return false
    return ['fullName', 'line1', 'city', 'region', 'postal', 'country', 'phone'].every((key) => address[key]?.trim())
  }

  function paymentReady() {
    if (payment.method === 'cod') return true
    if (payment.method === 'wallet') return Boolean(payment.wallet)
    const digits = payment.cardNumber.replace(/\s+/g, '')
    return /^\d{12,19}$/.test(digits) && /^\d{2}\/\d{2}$/.test(payment.expiry) && /^\d{3,4}$/.test(payment.cvc)
  }

  function goNext() {
    if (step === 0 && !addressReady()) {
      setError('Enter your contact details and a complete shipping address.')
      return
    }
    if (step === 2 && !paymentReady()) {
      setError('Check the payment details. Card expiry uses MM/YY.')
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, 3))
  }

  function onPlace(event) {
    event.preventDefault()
    const result = placeOrder({
      contact,
      address,
      delivery,
      payment,
      saveAddress: Boolean(user) && saveAddress,
    })
    if (!result.ok) {
      setError(result.error)
      if (result.code === 'declined') setStep('failed')
      return
    }
    setPlaced(true)
    navigate(`/order/${result.order.id}`, { state: { justPlaced: true } })
  }

  return (
    <div className="page checkout">
      <h1>Checkout</h1>
      <ol className="stepper">
        {steps.map((label, index) => (
          <li key={label} className={step === index ? 'active' : step !== 'failed' && index < step ? 'done' : ''}>
            {label}
          </li>
        ))}
      </ol>

      {error && step !== 'failed' && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {step === 'failed' ? (
        <section className="failure-panel">
          <p className="eyebrow">PAYMENT FAILED</p>
          <h2>Your payment was declined</h2>
          <p>{error}</p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={() => { setStep(2); setError('') }}>
              Try another payment
            </button>
            <Link className="ghost-button" to="/cart">
              Back to bag
            </Link>
          </div>
        </section>
      ) : (
        <form className="checkout-grid" onSubmit={onPlace}>
          <div className="checkout-main">
            {step === 0 && (
              <section>
                <h2>Shipping address</h2>
                {user?.addresses.length > 0 && (
                  <div className="option-list">
                    {user.addresses.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`option-chip${address.id === item.id ? ' active' : ''}`}
                        onClick={() => setAddress({ ...item })}
                      >
                        {item.line1}, {item.city}
                      </button>
                    ))}
                  </div>
                )}
                <div className="form-grid">
                  <label className="field">
                    Full name
                    <input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label className="field">
                    Email
                    <input type="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} />
                  </label>
                  <label className="field">
                    Recipient
                    <input value={address.fullName} onChange={(event) => patchAddress('fullName', event.target.value)} />
                  </label>
                  <label className="field">
                    Phone
                    <input value={address.phone} onChange={(event) => patchAddress('phone', event.target.value)} />
                  </label>
                </div>
                <label className="field">
                  Street address
                  <input value={address.line1} onChange={(event) => patchAddress('line1', event.target.value)} />
                </label>
                <div className="form-grid">
                  <label className="field">
                    City
                    <input value={address.city} onChange={(event) => patchAddress('city', event.target.value)} />
                  </label>
                  <label className="field">
                    State
                    <input value={address.region} onChange={(event) => patchAddress('region', event.target.value)} />
                  </label>
                  <label className="field">
                    Postal code
                    <input value={address.postal} onChange={(event) => patchAddress('postal', event.target.value)} />
                  </label>
                  <label className="field">
                    Country
                    <input value={address.country} onChange={(event) => patchAddress('country', event.target.value)} />
                  </label>
                </div>
                {user && (
                  <label className="filter-check">
                    <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
                    Save this address to my profile
                  </label>
                )}
              </section>
            )}

            {step === 1 && (
              <section>
                <h2>Delivery method</h2>
                <div className="choice-list">
                  {deliveryMethods.map((method) => (
                    <label key={method.id} className={`choice${deliveryId === method.id ? ' active' : ''}`}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryId === method.id}
                        onChange={() => setDeliveryId(method.id)}
                      />
                      <span>
                        <strong>{method.label}</strong>
                        <small>{method.detail}</small>
                      </span>
                      <strong>{method.price === 0 ? 'Free' : formatPrice(method.price)}</strong>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2>Payment</h2>
                <p className="muted">Demo checkout only. No real charge is made. A card ending in 0000 is declined.</p>
                <div className="choice-list">
                  {[
                    ['card', 'Card'],
                    ['wallet', 'Wallet'],
                    ['cod', 'Cash on delivery'],
                  ].map(([id, label]) => (
                    <label key={id} className={`choice${payment.method === id ? ' active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={payment.method === id}
                        onChange={() => setPayment((current) => ({ ...current, method: id }))}
                      />
                      <span>
                        <strong>{label}</strong>
                      </span>
                    </label>
                  ))}
                </div>
                {payment.method === 'card' && (
                  <div className="form-grid">
                    <label className="field">
                      Card number
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="4242424242424242"
                        value={payment.cardNumber}
                        onChange={(event) => setPayment((current) => ({ ...current, cardNumber: event.target.value }))}
                      />
                    </label>
                    <label className="field">
                      Expiry
                      <input
                        placeholder="MM/YY"
                        value={payment.expiry}
                        onChange={(event) => setPayment((current) => ({ ...current, expiry: event.target.value }))}
                      />
                    </label>
                    <label className="field">
                      CVC
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        value={payment.cvc}
                        onChange={(event) => setPayment((current) => ({ ...current, cvc: event.target.value }))}
                      />
                    </label>
                  </div>
                )}
                {payment.method === 'wallet' && (
                  <div className="option-list">
                    {['PayPal', 'Apple Pay'].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        className={`option-chip${payment.wallet === wallet ? ' active' : ''}`}
                        onClick={() => setPayment((current) => ({ ...current, wallet }))}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                )}
                {payment.method === 'cod' && <p>Pay the courier when the order arrives. The order is placed as processing.</p>}
              </section>
            )}

            {step === 3 && (
              <section>
                <h2>Review your order</h2>
                <ul className="review-items">
                  {priced.detailed.map((line) => (
                    <li key={line.id}>
                      <span>
                        {line.product.name} × {line.quantity}
                        <small>{[line.color, line.size].filter(Boolean).join(' · ')}</small>
                      </span>
                      <strong>{formatPrice(line.lineTotal)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="review-block">
                  <h3>Ship to</h3>
                  <p>
                    {address.fullName}
                    <br />
                    {address.line1}
                    <br />
                    {address.city}, {address.region} {address.postal}
                    <br />
                    {address.country}
                  </p>
                  <p>
                    {contact.name} · {contact.email}
                  </p>
                </div>
                <div className="review-block">
                  <h3>Delivery</h3>
                  <p>
                    {delivery.label} · {delivery.detail}
                  </p>
                </div>
                <div className="review-block">
                  <h3>Payment</h3>
                  <p>
                    {payment.method === 'card' && `Card ending ${payment.cardNumber.replace(/\s+/g, '').slice(-4)}`}
                    {payment.method === 'wallet' && payment.wallet}
                    {payment.method === 'cod' && 'Cash on delivery'}
                  </p>
                </div>
              </section>
            )}

            <div className="button-row">
              {step > 0 && (
                <button className="ghost-button" type="button" onClick={() => { setError(''); setStep((current) => current - 1) }}>
                  Back
                </button>
              )}
              {step < 3 && (
                <button className="primary-button" type="button" onClick={goNext}>
                  Continue
                </button>
              )}
              {step === 3 && (
                <button className="primary-button" type="submit">
                  Place order
                </button>
              )}
            </div>
          </div>

          <aside className="summary">
            <h2>Order summary</h2>
            {priced.detailed.map((line) => (
              <div className="summary-row" key={line.id}>
                <span>
                  {line.product.name} × {line.quantity}
                </span>
                <span>{formatPrice(line.lineTotal)}</span>
              </div>
            ))}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(priced.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{priced.discount > 0 ? `−${formatPrice(priced.discount)}` : formatPrice(0)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{priced.shipping === 0 ? 'Free' : formatPrice(priced.shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{formatPrice(priced.total)}</strong>
            </div>
          </aside>
        </form>
      )}
    </div>
  )
}
