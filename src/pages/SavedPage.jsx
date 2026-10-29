import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useShop } from '../hooks/useShop'

export default function SavedPage() {
  const { products, favorites } = useShop()
  const saved = products.filter((product) => favorites.includes(product.id))

  return (
    <div className="page">
      <h1>Saved</h1>
      {saved.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing saved yet</h3>
          <p>Hearts on a product stay in this browser after a refresh.</p>
          <Link className="primary-button" to="/">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
