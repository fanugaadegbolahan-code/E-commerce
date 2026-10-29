import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useShop } from '../hooks/useShop'
import { formatPrice } from '../lib/commerce'

export default function Layout({ children }) {
  const { cartCount, totals, user, applyPromo } = useShop()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const showBag = cartCount > 0 && location.pathname !== '/cart' && location.pathname !== '/checkout'

  function onSearch(value) {
    if (location.pathname === '/') {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value.trim()) next.set('q', value)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
      return
    }
    const next = new URLSearchParams()
    if (value.trim()) next.set('q', value)
    navigate({ pathname: '/', search: next.toString() })
  }

  function useWelcomeCode() {
    applyPromo('WELCOME10')
    navigate('/cart')
  }

  return (
    <>
      <header className="header">
        <nav className="container nav" aria-label="Main navigation">
          <Link className="logo" to="/" aria-label="ADEDAYHO home">
            ade<span>dayho</span>
          </Link>
          <div className="nav-links">
            <Link to="/">Shop</Link>
            <Link to="/saved">Saved</Link>
            {user?.isAdmin && <Link to="/admin">Admin</Link>}
            <Link to={user ? '/account' : '/login'}>{user ? user.name.split(' ')[0] : 'Log in'}</Link>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search the shop"
                aria-label="Search products"
                value={query}
                onChange={(event) => onSearch(event.target.value)}
              />
            </label>
            <Link className="cart-button" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 8h14l1 13H4L5 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>
        </nav>
      </header>

      <div className="offer-banner">
        <p>
          Current offer: 10% off with{' '}
          <button type="button" onClick={useWelcomeCode}>
            WELCOME10
          </button>
          . Orders over $80 can use SAVE15. FREESHIP covers standard delivery.
        </p>
      </div>

      <main>{children}</main>

      {showBag && (
        <aside className="cart-panel" aria-live="polite">
          <div>
            <strong>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag
            </strong>
            <span>Subtotal: {formatPrice(totals.subtotal)}</span>
          </div>
          <Link className="primary-button" to="/cart">
            View bag
          </Link>
        </aside>
      )}

      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <Link className="logo" to="/">
                ADE<span>DAYHO</span>
              </Link>
              <p>Everyday essentials, thoughtfully found.</p>
            </div>
            <div className="footer-links">
              <Link to="/">Shop all</Link>
              <Link to="/track">Track an order</Link>
              <Link to={user ? '/account' : '/login'}>Account</Link>
              <a href="mailto:hello@adedayho.shop">Get in touch</a>
            </div>
          </div>
          <p className="copyright">© 2026 ADEDAYHO. Made for everyday.</p>
        </div>
      </footer>
    </>
  )
}
