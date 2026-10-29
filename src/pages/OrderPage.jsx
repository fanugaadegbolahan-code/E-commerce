import { Link, useLocation, useParams } from 'react-router-dom'
import { useShop } from '../hooks/useShop'
import { formatPrice, STATUS_LABELS } from '../lib/commerce'

export default function OrderPage() {
  const { id } = useParams()
  const location = useLocation()
  const { orders, requestReturn, user } = useShop()
  const order = orders.find((item) => item.id === id)

  if (!order) {
    return (
      <div className="page">
        <h1>Order not found</h1>
        <p className="lede">Check the order number, or track it from the same browser that placed it.</p>
        <Link className="primary-button" to="/track">
          Track an order
        </Link>
      </div>
    )
  }

  const owns = user && (order.userId === user.id || order.email === user.email)
  const paymentLabel =
    order.payment.method === 'card'
      ? `Card ···· ${order.payment.last4}`
      : order.payment.method === 'wallet'
        ? order.payment.wallet
        : 'Cash on delivery'

  function onReturn() {
    requestReturn(order.id)
  }

  return (
    <div className="page">
      {location.state?.justPlaced && (
        <p className="alert alert-success" role="status">
          Order placed. This is your receipt.
        </p>
      )}
      <p className="eyebrow">ORDER {order.id}</p>
      <div className="title-row">
        <h1>Receipt</h1>
        <span className={`status status-${order.status}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
      </div>
      <p className="lede">
        Placed {new Date(order.createdAt).toLocaleString()} for {order.name}.{' '}
        {`Payment: ${paymentLabel} (${order.payment.status === 'paid' ? 'paid' : 'due on delivery'}).`}
      </p>

      <div className="order-layout">
        <section>
          <h2>Items</h2>
          <ul className="review-items">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size}-${item.color}`}>
                <span>
                  <Link to={`/product/${item.productId}`}>{item.name}</Link> × {item.quantity}
                  <small>{[item.color, item.size].filter(Boolean).join(' · ')}</small>
                </span>
                <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Discount {order.promo ? `(${order.promo.code})` : ''}</span>
            <span>{order.discount > 0 ? `−${formatPrice(order.discount)}` : formatPrice(0)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping · {order.delivery.label}</span>
            <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </section>

        <aside>
          <h2>Tracking</h2>
          <ol className="timeline">
            {order.events.map((event) => (
              <li key={`${event.status}-${event.at}`}>
                <strong>{event.label}</strong>
                <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
              </li>
            ))}
          </ol>
          <h2>Ship to</h2>
          <p>
            {order.address.fullName}
            <br />
            {order.address.line1}
            <br />
            {order.address.city}, {order.address.region} {order.address.postal}
            <br />
            {order.address.country}
            <br />
            {order.address.phone}
          </p>
          {owns && ['shipped', 'delivered'].includes(order.status) && (
            <button className="ghost-button" type="button" onClick={onReturn}>
              Request a return
            </button>
          )}
          {order.status === 'return_requested' && <p className="muted">Return requested. The shop will confirm it.</p>}
          {order.status === 'returned' && <p className="muted">Returned. Stock has been added back to the shop.</p>}
        </aside>
      </div>
    </div>
  )
}
