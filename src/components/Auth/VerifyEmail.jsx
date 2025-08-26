'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function VerifyEmail() {
    const router = useRouter()
    const [code, setCode] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        const registeredEmail = localStorage.getItem('registeredEmail')
        if (registeredEmail) {
            setEmail(registeredEmail)
        } else {
            router.push('/auth/register')
        }
    }, [])

    const verifyEmailMutation = useMutation({
        mutationFn: async (data) => {
            console.log('📤 Sending verification request with data:', data)
            const response = await axios.post('https://st.amjadshbib.com/api/verify-email', {
                email: data.email,
                code: data.code
            })
            console.log('✅ Verification success response:', response.data)
            return response.data
        },
        onSuccess: () => {
            toast.success('Email verified successfully!')
            localStorage.removeItem('registeredEmail')
            router.push('/auth/login')
        },
        onError: (error) => {
            console.error('❌ Verification failed:', error)

            if (error.response) {
                const { status, data } = error.response

                console.group('🔴 Axios Error Response')
                console.log('Status:', status)
                console.log('Data:', data)
                console.groupEnd()

                // ✅ التعامل مع رسالة "Validation errors"
                if (data?.message === 'Validation errors' && Array.isArray(data?.data) && data.data.length > 0) {
                    toast.error(data.data[0])
                }
                // ✅ فحص الرسالة العامة
                else if (typeof data?.message === 'string') {
                    toast.error(data.message)
                } 
                // fallback عام
                else {
                    toast.error('Verification failed. Please check the code and try again.')
                }
            } else if (error.request) {
                console.error('🟠 No response received:', error.request)
                toast.error('Network error. Please try again.')
            } else {
                console.error('🟡 Unexpected error:', error.message)
                toast.error('An unexpected error occurred.')
            }
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        verifyEmailMutation.mutate({ email, code })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter the verification code sent to <span className="font-medium text-[#8bc34a]">{email}</span>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="code" className="sr-only">Verification Code</label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-[#8bc34a] focus:border-[#8bc34a] focus:z-10 sm:text-sm"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={verifyEmailMutation.isPending}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8bc34a] hover:bg-[#7fb440] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8bc34a] disabled:opacity-50"
                            disabled={verifyEmailMutation.isPending || !code}
                        >
                            {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
