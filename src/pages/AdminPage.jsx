import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { categories } from '../data/catalog'
import { useShop } from '../hooks/useShop'
import { formatPrice, STATUS_LABELS } from '../lib/commerce'

const blankProduct = {
  name: '',
  category: 'Apparel',
  price: '',
  salePrice: '',
  stock: '',
  image: '',
  description: '',
  sizes: '',
  colors: '',
}

export default function AdminPage() {
  const { user, products, orders, users, addProduct, updateProduct, removeProduct, updateOrderStatus, markOrderPaid } = useShop()
  const [tab, setTab] = useState('catalog')
  const [draft, setDraft] = useState(blankProduct)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const editorRef = useRef(null)
  const showEditor = adding || editingId != null

  useEffect(() => {
    if (!showEditor) return
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [showEditor, editingId])

  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (!user.isAdmin) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p className="lede">This account cannot manage the shop.</p>
        <Link className="primary-button" to="/">
          Back to the shop
        </Link>
      </div>
    )
  }

  function loadProduct(product) {
    setAdding(false)
    setEditingId(product.id)
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      salePrice: product.salePrice ?? '',
      stock: String(product.stock),
      image: product.image,
      description: product.description,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
    })
    setTab('catalog')
  }

  function onProduct(event) {
    event.preventDefault()
    const result = editingId ? updateProduct(editingId, draft) : addProduct(draft)
    setNotice(result.ok ? (editingId ? 'Product updated.' : 'Product added.') : result.error)
    if (result.ok) {
      setDraft(blankProduct)
      setEditingId(null)
      setAdding(false)
    }
  }

  function onStatus(orderId, status) {
    const result = updateOrderStatus(orderId, status)
    setNotice(result.ok ? 'Order updated.' : result.error)
  }

  return (
    <div className="page">
      <h1>Shop admin</h1>
      <div className="tabs">
        {[
          ['catalog', 'Catalog'],
          ['orders', 'Orders'],
          ['customers', 'Customers'],
        ].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {notice && <p className="alert alert-success">{notice}</p>}

      {tab === 'catalog' && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </td>
                    <td>
                      {formatPrice(product.salePrice && product.salePrice < product.price ? product.salePrice : product.price)}
                    </td>
                    <td>{product.stock}</td>
                    <td className="row-actions">
                      <button type="button" className="ghost-button" onClick={() => loadProduct(product)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          if (window.confirm(`Remove ${product.name} from the shop?`)) removeProduct(product.id)
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showEditor && (
            <button className="primary-button admin-add" type="button" onClick={() => setAdding(true)}>
              Add a product
            </button>
          )}
          {showEditor && (
          <form id="product-editor" ref={editorRef} className="stack-form admin-form" onSubmit={onProduct}>
            <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
            <div className="form-grid">
              <label className="field">
                Name
                <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="field">
                Category
                <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                  {categories.filter((item) => item !== 'All items').map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Price
                <input value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} />
              </label>
              <label className="field">
                Sale price
                <input value={draft.salePrice} onChange={(event) => setDraft((current) => ({ ...current, salePrice: event.target.value }))} placeholder="Optional" />
              </label>
              <label className="field">
                Stock
                <input value={draft.stock} onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))} />
              </label>
              <label className="field">
                Image URL
                <input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} />
              </label>
            </div>
            <label className="field">
              Description
              <textarea rows="3" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="form-grid">
              <label className="field">
                Sizes
                <input value={draft.sizes} onChange={(event) => setDraft((current) => ({ ...current, sizes: event.target.value }))} placeholder="S, M, L" />
              </label>
              <label className="field">
                Colors
                <input value={draft.colors} onChange={(event) => setDraft((current) => ({ ...current, colors: event.target.value }))} placeholder="Sand, Navy" />
              </label>
            </div>
            <div className="button-row">
              <button className="primary-button" type="submit">
                {editingId ? 'Save product' : 'Add product'}
              </button>
              {editingId && (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setAdding(false)
                    setDraft(blankProduct)
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5">No orders yet.</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/order/${order.id}`}>{order.id}</Link>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    {order.name}
                    <small>{order.email}</small>
                  </td>
                  <td>{formatPrice(order.total)}</td>
                  <td>
                    {order.payment.status === 'paid' ? 'Paid' : 'Due'}
                    {order.payment.status !== 'paid' && (
                      <button type="button" className="text-button" onClick={() => markOrderPaid(order.id)}>
                        Mark paid
                      </button>
                    )}
                  </td>
                  <td>
                    <select value={order.status} onChange={(event) => onStatus(order.id, event.target.value)}>
                      {Object.entries(STATUS_LABELS)
                        .filter(([status]) => status !== 'placed')
                        .map(([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'customers' && (
        <div className="stack">
          {users.map((account) => {
            const history = orders.filter((order) => order.userId === account.id || order.email === account.email)
            const spent = history.reduce((sum, order) => sum + order.total, 0)
            return (
              <article key={account.id} className="address-card">
                <p>
                  <strong>{account.name}</strong> {account.isAdmin ? '· Admin' : ''}
                  <br />
                  {account.email}
                  <br />
                  {history.length} {history.length === 1 ? 'order' : 'orders'} · {formatPrice(spent)}
                </p>
                {history.length > 0 && (
                  <ul className="plain-list">
                    {history.map((order) => (
                      <li key={order.id}>
                        <Link to={`/order/${order.id}`}>{order.id}</Link> · {STATUS_LABELS[order.status]} · {formatPrice(order.total)}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
