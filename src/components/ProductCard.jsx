import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../hooks/useShop'
import { averageRating } from '../lib/commerce'
import { Price, Stars } from './Price'

export default function ProductCard({ product }) {
  const { addToCart, toggleFavorite, favorites } = useShop()
  const [message, setMessage] = useState('')
  const favorite = favorites.includes(product.id)
  const soldOut = product.stock < 1
  const onSale = product.salePrice != null && product.salePrice < product.price
  const rating = averageRating(product)

  function onAdd() {
    const result = addToCart({
      productId: product.id,
      size: product.sizes[0] ?? '',
      color: product.colors[0] ?? '',
      quantity: 1,
    })
    setMessage(result.ok ? 'Added to your bag.' : result.error)
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.alt} loading="lazy" />
        </Link>
        {onSale && <span className="badge">Sale</span>}
        {soldOut && <span className="badge badge-dark">Sold out</span>}
        <button
          className={`wishlist${favorite ? ' is-saved' : ''}`}
          type="button"
          aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} ${favorite ? 'from' : 'to'} favorites`}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product.id)}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        {rating > 0 && (
          <p className="card-rating">
            <Stars value={rating} />
            <span>{product.reviews.length}</span>
          </p>
        )}
        <div className="product-bottom">
          <Price product={product} />
          <button className="add-button" type="button" onClick={onAdd} disabled={soldOut}>
            {soldOut ? 'Sold out' : 'Add to bag'}
          </button>
        </div>
        {message && <p className="card-note">{message}</p>}
      </div>
    </article>
  )
}
