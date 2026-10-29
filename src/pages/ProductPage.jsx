import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { Price, Stars } from '../components/Price'
import { useShop } from '../hooks/useShop'
import { averageRating, stockLabel } from '../lib/commerce'

export default function ProductPage() {
  const { id } = useParams()
  const { products, addToCart, toggleFavorite, favorites, addReview, user } = useShop()
  const product = products.find((item) => item.id === Number(id))
  const [photo, setPhoto] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [review, setReview] = useState({ author: user?.name ?? '', rating: '5', text: '' })
  const [reviewMessage, setReviewMessage] = useState('')

  if (!product) {
    return (
      <div className="page">
        <h1>Product not found</h1>
        <p className="lede">That piece is no longer in the shop.</p>
        <Link className="primary-button" to="/">
          Back to the shop
        </Link>
      </div>
    )
  }

  const photos = product.images?.length ? product.images : [product.image]
  const activePhoto = photos[Math.min(photo, photos.length - 1)]
  const soldOut = product.stock < 1
  const favorite = favorites.includes(product.id)
  const rating = averageRating(product)
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)

  function onAdd(event) {
    event.preventDefault()
    const result = addToCart({ productId: product.id, size, color, quantity })
    setMessage(result.ok ? 'Added to your bag.' : result.error)
  }

  function onReview(event) {
    event.preventDefault()
    const result = addReview(product.id, review)
    setReviewMessage(result.ok ? 'Thanks. Your review is on the page.' : result.error)
    if (result.ok) setReview((current) => ({ ...current, text: '' }))
  }

  return (
    <div className="page">
      <Link className="text-button" to="/">
        ← Back to the shop
      </Link>
      <div className="pdp">
        <div className="pdp-gallery">
          <img src={activePhoto} alt={product.alt} />
          {photos.length > 1 && (
            <div className="pdp-thumbs">
              {photos.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={index === photo ? 'active' : ''}
                  onClick={() => setPhoto(index)}
                  aria-label={`Photo ${index + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="pdp-copy" onSubmit={onAdd}>
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          {rating > 0 && (
            <p className="card-rating">
              <Stars value={rating} />
              <a href="#reviews">
                {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}
              </a>
            </p>
          )}
          <Price product={product} />
          <p className={soldOut ? 'stock-out' : 'stock-ok'}>{stockLabel(product.stock)}</p>
          <p className="description">{product.description}</p>

          {product.colors.length > 0 && (
            <fieldset className="option-row">
              <legend>Color{color ? `: ${color}` : ''}</legend>
              <div className="option-list">
                {product.colors.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`option-chip${color === item ? ' active' : ''}`}
                    aria-pressed={color === item}
                    onClick={() => setColor(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {product.sizes.length > 0 && (
            <fieldset className="option-row">
              <legend>Size{size ? `: ${size}` : ''}</legend>
              <div className="option-list">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`option-chip${size === item ? ' active' : ''}`}
                    aria-pressed={size === item}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="buy-row">
            <div className="qty">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
                aria-label="Increase quantity"
                disabled={soldOut}
              >
                +
              </button>
            </div>
            <button className="primary-button" type="submit" disabled={soldOut}>
              {soldOut ? 'Out of stock' : 'Add to bag'}
            </button>
            <button
              className={`wishlist wishlist-inline${favorite ? ' is-saved' : ''}`}
              type="button"
              aria-pressed={favorite}
              onClick={() => toggleFavorite(product.id)}
            >
              {favorite ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
          {message && (
            <p className={message.startsWith('Added') ? 'alert alert-success' : 'alert alert-error'} role="status">
              {message}{' '}
              {message.startsWith('Added') && <Link to="/cart">View bag</Link>}
            </p>
          )}
        </form>
      </div>

      <section className="reviews" id="reviews">
        <h2>Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="lede">No reviews yet.</p>
        ) : (
          <div className="review-list">
            {product.reviews.map((item) => (
              <article key={item.id}>
                <Stars value={item.rating} />
                <h3>{item.author}</h3>
                <p>{item.text}</p>
                <time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time>
              </article>
            ))}
          </div>
        )}
        <form className="review-form" onSubmit={onReview}>
          <h3>Write a review</h3>
          <div className="form-grid">
            <label className="field">
              Name
              <input
                value={review.author}
                onChange={(event) => setReview((current) => ({ ...current, author: event.target.value }))}
              />
            </label>
            <label className="field">
              Rating
              <select
                value={review.rating}
                onChange={(event) => setReview((current) => ({ ...current, rating: event.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>
                    {score} star{score === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Review
            <textarea
              rows="4"
              value={review.text}
              onChange={(event) => setReview((current) => ({ ...current, text: event.target.value }))}
            />
          </label>
          {reviewMessage && <p className="card-note">{reviewMessage}</p>}
          <button className="primary-button" type="submit">
            Publish review
          </button>
        </form>
      </section>

      {related.length > 0 && (
        <section className="related">
          <h2>You may also like</h2>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
