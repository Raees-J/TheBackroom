'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()

  useEffect(() => {
    // Get phone number from session storage
    const phone = sessionStorage.getItem('pendingPhone')
    if (!phone) {
      router.push('/auth/signin')
      return
    }
    setPhoneNumber(phone)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')
    if (codeToVerify.length !== 6) return

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          code: codeToVerify,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Store auth token
      localStorage.setItem('authToken', data.token)
      sessionStorage.removeItem('pendingPhone')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.')
      setCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setCanResend(false)
    setCountdown(60)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend code')
      }

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
      setCanResend(true)
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
          <h1 className="text-3xl font-bold mb-2">Enter verification code</h1>
          <p className="text-gray-400">
            We sent a 6-digit code to{' '}
            <span className="text-white font-mono">{phoneNumber}</span>
          </p>
        </div>

        {/* Verification Form */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          {/* Code Input */}
          <div className="flex justify-center space-x-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-brand-dark border border-white/10 rounded-lg text-center text-2xl font-bold focus:outline-none focus:border-brand-green transition"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || code.some((d) => !d)}
            className="w-full bg-brand-green text-brand-darker px-6 py-3 rounded-lg font-semibold hover:glow-green transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
          >
            {isLoading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Verify</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-brand-green hover:underline flex items-center justify-center space-x-2 mx-auto"
              >
                <span className="text-brand-green">🔄</span>
                <span>Resend code</span>
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Resend code in {countdown}s
              </p>
            )}
          </div>
        </div>

        {/* Back to Sign In */}
        <div className="text-center mt-6">
          <a href="/auth/signin" className="text-gray-400 hover:text-white transition">
            ← Use a different number
          </a>
        </div>
      </motion.div>
    </div>
  )
}
