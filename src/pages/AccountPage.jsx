import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useShop } from '../hooks/useShop'
import { formatPrice, STATUS_LABELS } from '../lib/commerce'

const emptyAddress = {
  fullName: '',
  line1: '',
  city: '',
  region: '',
  postal: '',
  country: 'United States',
  phone: '',
}

export default function AccountPage() {
  const { user, orders, updateProfile, saveAddress, removeAddress, logout } = useShop()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'profile'
  const [name, setName] = useState(user?.name ?? '')
  const [notice, setNotice] = useState('')
  const [address, setAddress] = useState(emptyAddress)

  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />

  const mine = orders.filter((order) => order.userId === user.id || order.email === user.email)

  function onProfile(event) {
    event.preventDefault()
    const result = updateProfile({ name })
    setNotice(result.ok ? 'Profile saved.' : result.error)
  }

  function onAddress(event) {
    event.preventDefault()
    const result = saveAddress(address)
    setNotice(result.ok ? 'Address saved.' : result.error)
    if (result.ok) setAddress(emptyAddress)
  }

  return (
    <div className="page">
      <div className="title-row">
        <h1>Account</h1>
        <button className="ghost-button" type="button" onClick={logout}>
          Log out
        </button>
      </div>
      <p className="lede">{user.email}</p>
      <div className="tabs" role="tablist">
        {[
          ['profile', 'Profile'],
          ['addresses', 'Addresses'],
          ['orders', 'Orders'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setParams(id === 'profile' ? {} : { tab: id })}
          >
            {label}
          </button>
        ))}
      </div>
      {notice && <p className="alert alert-success">{notice}</p>}

      {tab === 'profile' && (
        <form className="stack-form narrow-form" onSubmit={onProfile}>
          <label className="field">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            Email
            <input value={user.email} readOnly />
          </label>
          <button className="primary-button" type="submit">
            Save profile
          </button>
        </form>
      )}

      {tab === 'addresses' && (
        <div className="account-grid">
          <div className="stack">
            {user.addresses.length === 0 && <p className="muted">No saved addresses yet.</p>}
            {user.addresses.map((item) => (
              <article key={item.id} className="address-card">
                <p>
                  <strong>{item.fullName}</strong>
                  <br />
                  {item.line1}
                  <br />
                  {item.city}, {item.region} {item.postal}
                  <br />
                  {item.country}
                  <br />
                  {item.phone}
                </p>
                <div className="line-actions">
                  <button className="text-button" type="button" onClick={() => setAddress(item)}>
                    Edit
                  </button>
                  <button className="text-button" type="button" onClick={() => removeAddress(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <form className="stack-form" onSubmit={onAddress}>
            <h2>{address.id ? 'Edit address' : 'New address'}</h2>
            {['fullName', 'line1', 'city', 'region', 'postal', 'country', 'phone'].map((key) => (
              <label className="field" key={key}>
                {key === 'line1' ? 'Street' : key === 'region' ? 'State' : key === 'postal' ? 'Postal code' : key === 'fullName' ? 'Full name' : key[0].toUpperCase() + key.slice(1)}
                <input
                  value={address[key]}
                  onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}
            <button className="primary-button" type="submit">
              Save address
            </button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div className="stack">
          {mine.length === 0 && <p className="muted">No orders yet. Orders use the email on your account.</p>}
          {mine.map((order) => (
            <Link key={order.id} className="order-row" to={`/order/${order.id}`}>
              <span>
                <strong>{order.id}</strong>
                <small>{new Date(order.createdAt).toLocaleDateString()}</small>
              </span>
              <span className={`status status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
              <strong>{formatPrice(order.total)}</strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
