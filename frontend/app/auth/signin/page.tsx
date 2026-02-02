'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // DEMO MODE: Type "demo" to bypass authentication (frontend only)
      if (phoneNumber.toLowerCase() === 'demo') {
        setError('') // Clear any previous errors
        const demoToken = 'demo-token-' + Date.now()
        localStorage.setItem('authToken', demoToken)
        setIsLoading(false)
        router.push('/dashboard')
        return
      }

      // Format phone number (remove spaces, add +27 if needed)
      let formattedPhone = phoneNumber.replace(/\s/g, '')
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+27' + formattedPhone.substring(1)
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+27' + formattedPhone
      }

      // Get API URL from environment or use production
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      // DEV MODE: Try dev-login first (skips OTP)
      try {
        const devResponse = await fetch(`${API_URL}/api/auth/dev-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: formattedPhone }),
        })

        if (devResponse.ok) {
          const devData = await devResponse.json()
          localStorage.setItem('authToken', devData.token)
          router.push('/dashboard')
          return
        }
      } catch (devError) {
        // Dev endpoint not available, continue with normal OTP flow
        console.log('Dev login not available, using OTP flow')
      }

      // Normal OTP flow
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      // Store phone number in session storage and redirect to verify page
      sessionStorage.setItem('pendingPhone', formattedPhone)
      router.push('/auth/verify')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-brand-darker to-brand-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-brand-darker font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold">The Backroom</span>
          </a>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to view your inventory</p>
        </div>

        {/* Sign In Form */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📱</span>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="083 930 0255"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-brand-green transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you a verification code via SMS
              </p>
              <p className="text-xs text-brand-green mt-1">
                💡 Dev tip: Type "demo" to skip authentication
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full bg-brand-green text-brand-darker px-6 py-3 rounded-lg font-semibold hover:glow-green transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Sending code...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 flex items-start space-x-2 text-sm text-gray-400">
            <Shield className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
            <p>
              Your phone number is encrypted and only used for authentication. We never share your data.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a href="/" className="text-gray-400 hover:text-white transition">
            ← Back to home
          </a>
        </div>
      </motion.div>
    </div>
  )
}
