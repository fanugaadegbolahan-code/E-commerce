import { useEffect, useMemo, useState } from 'react'
import { adminUser, products as seedProducts, promos } from '../data/catalog'
import { lineId, quote, reservedQuantity, STATUS_LABELS } from '../lib/commerce'
import { ShopContext } from './shop-context'

const STORAGE = {
  products: 'adedayho.products',
  cart: 'adedayho.cart',
  favorites: 'adedayho.favorites',
  users: 'adedayho.users',
  session: 'adedayho.session',
  orders: 'adedayho.orders',
  promo: 'adedayho.promo',
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function withAdmin(users) {
  if (users.some((user) => user.email === adminUser.email)) return users
  return [adminUser, ...users]
}

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(() => readStorage(STORAGE.products, seedProducts))
  const [cart, setCart] = useState(() => {
    const storedCart = readStorage(STORAGE.cart, [])
    const storedProducts = readStorage(STORAGE.products, seedProducts)
    return storedCart.filter((line) => storedProducts.some((product) => product.id === line.productId))
  })
  const [favorites, setFavorites] = useState(() => readStorage(STORAGE.favorites, []))
  const [users, setUsers] = useState(() => withAdmin(readStorage(STORAGE.users, [adminUser])))
  const [userId, setUserId] = useState(() => readStorage(STORAGE.session, null))
  const [orders, setOrders] = useState(() => readStorage(STORAGE.orders, []))
  const [promo, setPromo] = useState(() => readStorage(STORAGE.promo, null))

  useEffect(() => writeStorage(STORAGE.products, products), [products])
  useEffect(() => writeStorage(STORAGE.cart, cart), [cart])
  useEffect(() => writeStorage(STORAGE.favorites, favorites), [favorites])
  useEffect(() => writeStorage(STORAGE.users, users), [users])
  useEffect(() => writeStorage(STORAGE.orders, orders), [orders])
  useEffect(() => writeStorage(STORAGE.promo, promo), [promo])
  useEffect(() => {
    if (userId) writeStorage(STORAGE.session, userId)
    else localStorage.removeItem(STORAGE.session)
  }, [userId])

  const user = users.find((account) => account.id === userId) ?? null

  const totals = useMemo(
    () => quote({ lines: cart, products, promo, delivery: null }),
    [cart, products, promo],
  )

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)

  function addToCart({ productId, size = '', color = '', quantity = 1 }) {
    const product = products.find((item) => item.id === productId)
    if (!product) return { ok: false, error: 'That piece is no longer available.' }
    if (product.sizes.length > 0 && !size) return { ok: false, error: 'Choose a size.' }
    if (product.colors.length > 0 && !color) return { ok: false, error: 'Choose a color.' }

    const id = lineId(productId, size, color)
    const existing = cart.find((line) => line.id === id)
    const nextQuantity = (existing?.quantity ?? 0) + quantity
    const others = reservedQuantity(cart, productId, id)

    if (product.stock < 1 || nextQuantity + others > product.stock) {
      const left = product.stock - others - (existing?.quantity ?? 0)
      return {
        ok: false,
        error: product.stock < 1 || left < 1 ? 'Out of stock.' : `Only ${product.stock} left.`,
      }
    }

    setCart((current) => {
      const match = current.find((line) => line.id === id)
      if (!match) return [...current, { id, productId, size, color, quantity }]
      return current.map((line) =>
        line.id === id ? { ...line, quantity: line.quantity + quantity } : line,
      )
    })

    return { ok: true }
  }

  function setQuantity(id, quantity) {
    const line = cart.find((item) => item.id === id)
    if (!line) return { ok: false, error: 'That item is not in your bag.' }
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== id))
      return { ok: true }
    }

    const product = products.find((item) => item.id === line.productId)
    const others = reservedQuantity(cart, line.productId, id)
    if (!product || quantity + others > product.stock) {
      return { ok: false, error: `Only ${product?.stock ?? 0} left.` }
    }

    setCart((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)))
    return { ok: true }
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((line) => line.id !== id))
  }

  function clearCart() {
    setCart([])
    setPromo(null)
  }

  function toggleFavorite(productId) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  function register({ name, email, password }) {
    const trimmedName = name.trim()
    const trimmedEmail = normalizeEmail(email)
    if (!trimmedName) return { ok: false, error: 'Enter your name.' }
    if (!trimmedEmail.includes('@')) return { ok: false, error: 'Enter a valid email.' }
    if (password.length < 6) return { ok: false, error: 'Use at least 6 characters for the password.' }
    if (users.some((account) => account.email === trimmedEmail)) {
      return { ok: false, error: 'An account with that email already exists.' }
    }

    const account = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail,
      password,
      isAdmin: false,
      addresses: [],
    }
    setUsers((current) => [...current, account])
    setUserId(account.id)
    return { ok: true, user: account }
  }

  function login({ email, password }) {
    const account = users.find((item) => item.email === normalizeEmail(email))
    if (!account || !account.password || account.password !== password) {
      return { ok: false, error: 'Email or password does not match.' }
    }
    setUserId(account.id)
    return { ok: true, user: account }
  }

  function loginWithProvider(provider) {
    const email = provider === 'Google' ? 'google.demo@adedayho.shop' : 'apple.demo@adedayho.shop'
    const name = provider === 'Google' ? 'Google Demo' : 'Apple Demo'
    let account = users.find((item) => item.email === email)

    if (!account) {
      account = {
        id: crypto.randomUUID(),
        name,
        email,
        password: '',
        provider,
        isAdmin: false,
        addresses: [],
      }
      setUsers((current) => [...current, account])
    }

    setUserId(account.id)
    return { ok: true, user: account }
  }

  function logout() {
    setUserId(null)
  }

  function updateProfile({ name }) {
    if (!user) return { ok: false, error: 'Log in to update your profile.' }
    const trimmedName = name.trim()
    if (!trimmedName) return { ok: false, error: 'Enter your name.' }
    setUsers((current) =>
      current.map((account) => (account.id === user.id ? { ...account, name: trimmedName } : account)),
    )
    return { ok: true }
  }

  function saveAddress(address) {
    if (!user) return { ok: false, error: 'Log in to save an address.' }
    const next = {
      id: address.id || crypto.randomUUID(),
      fullName: address.fullName.trim(),
      line1: address.line1.trim(),
      city: address.city.trim(),
      region: address.region.trim(),
      postal: address.postal.trim(),
      country: address.country.trim(),
      phone: address.phone.trim(),
    }
    if (!next.fullName || !next.line1 || !next.city || !next.region || !next.postal || !next.country || !next.phone) {
      return { ok: false, error: 'Fill in every address field.' }
    }

    setUsers((current) =>
      current.map((account) => {
        if (account.id !== user.id) return account
        const exists = account.addresses.some((item) => item.id === next.id)
        return {
          ...account,
          addresses: exists
            ? account.addresses.map((item) => (item.id === next.id ? next : item))
            : [...account.addresses, next],
        }
      }),
    )
    return { ok: true, address: next }
  }

  function removeAddress(addressId) {
    if (!user) return
    setUsers((current) =>
      current.map((account) =>
        account.id === user.id
          ? { ...account, addresses: account.addresses.filter((item) => item.id !== addressId) }
          : account,
      ),
    )
  }

  function applyPromo(code) {
    const found = promos.find((item) => item.code === code.trim().toUpperCase())
    if (!found) return { ok: false, error: 'That code is not active.' }
    if (found.minSubtotal && totals.subtotal < found.minSubtotal) {
      return {
        ok: false,
        error: `${found.code} applies to orders over $${found.minSubtotal}.`,
      }
    }
    setPromo(found)
    return { ok: true, promo: found }
  }

  function clearPromo() {
    setPromo(null)
  }

  function addReview(productId, { author, rating, text }) {
    const body = text.trim()
    const name = author.trim()
    if (!name) return { ok: false, error: 'Enter your name.' }
    if (!body) return { ok: false, error: 'Write a short review.' }
    const score = Number(rating)
    if (score < 1 || score > 5) return { ok: false, error: 'Choose a rating from 1 to 5.' }

    const entry = {
      id: crypto.randomUUID(),
      author: name,
      rating: score,
      text: body,
      date: new Date().toISOString(),
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, reviews: [entry, ...product.reviews] } : product,
      ),
    )
    return { ok: true }
  }

  function placeOrder({ contact, address, delivery, payment, saveAddress: shouldSave }) {
    if (cart.length === 0) return { ok: false, error: 'Your bag is empty.' }

    const name = contact.name.trim()
    const email = normalizeEmail(contact.email)
    if (!name) return { ok: false, error: 'Enter the name for this order.' }
    if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' }

    const shipping = {
      fullName: address.fullName.trim(),
      line1: address.line1.trim(),
      city: address.city.trim(),
      region: address.region.trim(),
      postal: address.postal.trim(),
      country: address.country.trim(),
      phone: address.phone.trim(),
    }
    if (Object.values(shipping).some((value) => !value)) {
      return { ok: false, error: 'Fill in the shipping address.' }
    }

    for (const line of cart) {
      const product = products.find((item) => item.id === line.productId)
      const others = reservedQuantity(cart, line.productId, line.id)
      if (!product || line.quantity + others > product.stock) {
        return { ok: false, error: `${product?.name ?? 'An item'} does not have enough stock.` }
      }
    }

    if (payment.method === 'card') {
      const digits = payment.cardNumber.replace(/\s+/g, '')
      if (!/^\d{12,19}$/.test(digits)) return { ok: false, error: 'Enter a card number of 12 to 19 digits.' }
      if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) return { ok: false, error: 'Enter the expiry as MM/YY.' }
      if (!/^\d{3,4}$/.test(payment.cvc)) return { ok: false, error: 'Enter a 3 or 4 digit CVC.' }
      if (digits.endsWith('0000')) {
        return {
          ok: false,
          code: 'declined',
          error: 'Payment was declined. Nothing was charged, and your bag is unchanged.',
        }
      }
    }

    if (payment.method === 'wallet' && !payment.wallet) {
      return { ok: false, error: 'Choose a wallet.' }
    }

    const priced = quote({ lines: cart, products, promo, delivery })
    const now = new Date().toISOString()
    const paid = payment.method !== 'cod'
    const order = {
      id: `AD-${Date.now().toString().slice(-6)}`,
      userId: user?.id ?? null,
      email,
      name,
      items: priced.detailed.map((line) => ({
        productId: line.productId,
        name: line.product.name,
        image: line.product.image,
        unitPrice: line.unitPrice,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
      })),
      address: shipping,
      delivery: { id: delivery.id, label: delivery.label, price: priced.shipping },
      payment: {
        method: payment.method,
        wallet: payment.method === 'wallet' ? payment.wallet : '',
        last4: payment.method === 'card' ? payment.cardNumber.replace(/\s+/g, '').slice(-4) : '',
        status: paid ? 'paid' : 'due',
      },
      promo: priced.promoActive ? { code: promo.code, label: promo.label } : null,
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping,
      total: priced.total,
      status: 'processing',
      createdAt: now,
      events: [
        { status: 'placed', label: 'Order placed', at: now },
        {
          status: 'processing',
          label: paid ? 'Payment received' : 'Payment due on delivery',
          at: now,
        },
      ],
    }

    setProducts((current) =>
      current.map((product) => {
        const purchased = cart
          .filter((line) => line.productId === product.id)
          .reduce((sum, line) => sum + line.quantity, 0)
        if (!purchased) return product
        return { ...product, stock: Math.max(0, product.stock - purchased) }
      }),
    )
    setOrders((current) => [order, ...current])
    setCart([])
    setPromo(null)

    if (shouldSave && user) saveAddress({ ...shipping, id: address.id })

    return { ok: true, order }
  }

  function updateOrderStatus(orderId, status) {
    const order = orders.find((item) => item.id === orderId)
    if (!order || order.status === status) return { ok: true }

    const enteringReturn = status === 'returned' && order.status !== 'returned'
    const leavingReturn = order.status === 'returned' && status !== 'returned'

    if (leavingReturn) {
      const short = order.items.some((item) => {
        const product = products.find((entry) => entry.id === item.productId)
        return !product || product.stock < item.quantity
      })
      if (short) return { ok: false, error: 'Not enough stock to reopen this order.' }
    }

    if (enteringReturn || leavingReturn) {
      setProducts((current) =>
        current.map((product) => {
          const item = order.items.find((entry) => entry.productId === product.id)
          if (!item) return product
          const delta = enteringReturn ? item.quantity : -item.quantity
          return { ...product, stock: product.stock + delta }
        }),
      )
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === orderId
          ? {
              ...item,
              status,
              events: [
                ...item.events,
                { status, label: STATUS_LABELS[status] ?? status, at: new Date().toISOString() },
              ],
            }
          : item,
      ),
    )
    return { ok: true }
  }

  function markOrderPaid(orderId) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              payment: { ...order.payment, status: 'paid' },
              events: [
                ...order.events,
                { status: 'paid', label: 'Marked paid', at: new Date().toISOString() },
              ],
            }
          : order,
      ),
    )
  }

  function requestReturn(orderId) {
    const order = orders.find((item) => item.id === orderId)
    if (!order) return { ok: false, error: 'Order not found.' }
    const owns = user && (order.userId === user.id || order.email === user.email)
    if (!owns) return { ok: false, error: 'Log in with the email on this order to request a return.' }
    if (!['shipped', 'delivered'].includes(order.status)) {
      return { ok: false, error: 'A return can be requested after the order ships.' }
    }
    return updateOrderStatus(orderId, 'return_requested')
  }

  function addProduct(draft) {
    const product = normalizeProduct(draft)
    if (product.error) return product
    const id = products.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const next = { ...product.value, id, reviews: [], createdAt: new Date().toISOString() }
    setProducts((current) => [next, ...current])
    return { ok: true, product: next }
  }

  function updateProduct(productId, draft) {
    const product = normalizeProduct(draft)
    if (product.error) return product
    setProducts((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, ...product.value, id: item.id, reviews: item.reviews, createdAt: item.createdAt } : item,
      ),
    )
    return { ok: true }
  }

  function removeProduct(productId) {
    setProducts((current) => current.filter((item) => item.id !== productId))
    setFavorites((current) => current.filter((id) => id !== productId))
    setCart((current) => current.filter((line) => line.productId !== productId))
  }

  const value = {
    products,
    cart,
    favorites,
    user,
    users,
    orders,
    promo,
    totals,
    cartCount,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    toggleFavorite,
    register,
    login,
    loginWithProvider,
    logout,
    updateProfile,
    saveAddress,
    removeAddress,
    applyPromo,
    clearPromo,
    addReview,
    placeOrder,
    updateOrderStatus,
    markOrderPaid,
    requestReturn,
    addProduct,
    updateProduct,
    removeProduct,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

function normalizeProduct(draft) {
  const name = draft.name.trim()
  const category = draft.category.trim()
  const description = draft.description.trim()
  const image = draft.image.trim()
  const price = Number(draft.price)
  const stock = Number(draft.stock)
  const saleRaw = String(draft.salePrice ?? '').trim()
  const salePrice = saleRaw === '' ? null : Number(saleRaw)

  if (!name || !category || !description || !image) {
    return { ok: false, error: 'Name, category, description, and image are required.' }
  }
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: 'Enter a price above zero.' }
  if (String(draft.stock).trim() === '' || !Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: 'Stock must be a whole number.' }
  }
  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
    return { ok: false, error: 'Sale price must be lower than the regular price.' }
  }

  const sizes = splitList(draft.sizes)
  const colors = splitList(draft.colors)

  return {
    ok: true,
    value: {
      name,
      category,
      description,
      image,
      images: [image],
      alt: name,
      price,
      salePrice,
      stock,
      sizes,
      colors,
    },
  }
}

function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
