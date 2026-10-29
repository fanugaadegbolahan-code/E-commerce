import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useShop } from '../hooks/useShop'

export default function AuthPage({ mode }) {
  const { user, login, register, loginWithProvider } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const isSignup = mode === 'signup'
  const destination = location.state?.from || '/'

  if (user) return <Navigate to={destination} replace />

  function onChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function onSubmit(event) {
    event.preventDefault()
    const result = isSignup ? register(form) : login(form)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(destination)
  }

  function onProvider(provider) {
    loginWithProvider(provider)
    navigate(destination)
  }

  return (
    <div className="page narrow">
      <h1>{isSignup ? 'Create an account' : 'Log in'}</h1>
      <p className="lede">
        Accounts stay in this browser. Demo admin: admin@adedayho.shop / admin123
      </p>
      <form className="stack-form" onSubmit={onSubmit}>
        {isSignup && (
          <label className="field">
            Name
            <input name="name" value={form.name} onChange={onChange} autoComplete="name" />
          </label>
        )}
        <label className="field">
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" />
        </label>
        <label className="field">
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} autoComplete={isSignup ? 'new-password' : 'current-password'} />
        </label>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" type="submit">
          {isSignup ? 'Create account' : 'Log in'}
        </button>
      </form>
      <div className="divider">or</div>
      <div className="button-row">
        <button className="ghost-button" type="button" onClick={() => onProvider('Google')}>
          Continue with Google
        </button>
        <button className="ghost-button" type="button" onClick={() => onProvider('Apple')}>
          Continue with Apple
        </button>
      </div>
      <p className="muted">Demo social login creates a local profile. It does not contact Google or Apple.</p>
      <p className="muted">
        {isSignup ? (
          <>
            Already have an account? <Link to="/login">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link to="/signup">Create an account</Link>
          </>
        )}
      </p>
    </div>
  )
}
