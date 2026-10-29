import { Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import { ShopProvider } from './context/ShopContext'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import Home from './pages/Home'
import OrderPage from './pages/OrderPage'
import ProductPage from './pages/ProductPage'
import SavedPage from './pages/SavedPage'
import TrackPage from './pages/TrackPage'
import './styles.css'

function ProductRoute() {
  const { id } = useParams()
  return <ProductPage key={id} />
}

export default function App() {
  return (
    <ShopProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductRoute />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </ShopProvider>
  )
}
