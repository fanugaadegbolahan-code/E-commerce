import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function TrackPage() {
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')

  function onSubmit(event) {
    event.preventDefault()
    const id = orderId.trim().toUpperCase()
    if (!id) return
    navigate(`/order/${id}`)
  }

  return (
    <div className="page narrow">
      <h1>Track an order</h1>
      <p className="lede">Enter the order number from your receipt. Orders placed in this browser can be opened here.</p>
      <form className="stack-form" onSubmit={onSubmit}>
        <label className="field">
          Order number
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="AD-123456" />
        </label>
        <button className="primary-button" type="submit">
          View receipt
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/account">See your order history</Link>
      </p>
    </div>
  )
}
