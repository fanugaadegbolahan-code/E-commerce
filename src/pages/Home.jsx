import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories } from '../data/catalog'
import { useShop } from '../hooks/useShop'
import { averageRating, unitPrice } from '../lib/commerce'

export default function Home() {
  const { products } = useShop()
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const category = params.get('category') || 'All items'
  const sort = params.get('sort') || 'featured'
  const inStockOnly = params.get('stock') === '1'
  const saleOnly = params.get('sale') === '1'

  function updateParams(changes) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => {
        if (!value) next.delete(key)
        else next.set(key, value)
      })
      return next
    })
  }

  const visible = products
    .filter((product) => {
      const matchesCategory = category === 'All items' || product.category === category
      const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase()
      const matchesSearch = haystack.includes(query)
      const matchesStock = !inStockOnly || product.stock > 0
      const matchesSale = !saleOnly || (product.salePrice != null && product.salePrice < product.price)
      return matchesCategory && matchesSearch && matchesStock && matchesSale
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return unitPrice(a) - unitPrice(b)
      if (sort === 'price-desc') return unitPrice(b) - unitPrice(a)
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'rating') return averageRating(b) - averageRating(a)
      return 0
    })

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">GOOD THINGS, MADE TO LAST FFSWORLD</p>
            <h1>
              Everyday, <span>considered.</span>
            </h1>
            <p className="hero-description">
              Useful objects and easy essentials for the spaces you live in and the places you are going.
            </p>
            <a className="primary-button" href="#products">
              Explore the collection
            </a>
          </div>
        </div>
      </section>

      <section className="categories container" aria-label="Shop categories">
        <div className="section-heading">
          <h2>Find your everyday</h2>
          <span className="product-count">
            {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
        <div className="category-list" role="group" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              className={`category-button${category === item ? ' active' : ''}`}
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => updateParams({ category: item === 'All items' ? '' : item })}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="filters-row">
          <label className="field compact">
            <span>Sort</span>
            <select
              value={sort}
              aria-label="Sort products"
              onChange={(event) => updateParams({ sort: event.target.value === 'featured' ? '' : event.target.value })}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
          <label className="filter-check">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => updateParams({ stock: event.target.checked ? '1' : '' })}
            />
            In stock
          </label>
          <label className="filter-check">
            <input
              type="checkbox"
              checked={saleOnly}
              onChange={(event) => updateParams({ sale: event.target.checked ? '1' : '' })}
            />
            On sale
          </label>
        </div>
      </section>

      <section className="products-section container" id="products" aria-label="Products">
        {visible.length > 0 ? (
          <div className="product-grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No pieces found</h3>
            <p>Try another search or choose a different category.</p>
          </div>
        )}
      </section>

      <section className="promo" id="story">
        <div className="container promo-content">
          <div>
            <p className="eyebrow">A LITTLE LESS, A LITTLE BETTER</p>
            <h2>Made for the long run.</h2>
            <p>Thoughtful materials. Timeless shapes. Things you will reach for often.</p>
          </div>
          <a className="light-button" href="#products">
            Shop bestsellers
          </a>
        </div>
      </section>
    </>
  )
}
