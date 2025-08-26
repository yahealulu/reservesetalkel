'use client'

import { useRouter } from 'next/navigation'
import { useState, useContext, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AuthContext } from '@/context/AuthContext'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, user, isAuthLoading } = useContext(AuthContext)
    
    // Redirect if user is already logged in
    useEffect(() => {
        if (!isAuthLoading && user) {
            router.push('/')
        }
    }, [user, isAuthLoading, router])
    
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const response = await axios.post('https://st.amjadshbib.com/api/login', credentials)
            return response.data
        },
        onSuccess: (data) => {
            // Use the AuthContext login function instead of directly setting localStorage
            login(data.data.user, data.data.token);
           // toast.warning("Login Successfully");
            router.push('/') // Redirect to dashboard or appropriate page
        },
        onError: (error) => {
            // You might want to add proper error handling here
            console.error('Login failed:', error.message)
            alert('Login failed. Please check your credentials.')
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        loginMutation.mutate({ email, password })
    }

    return (
        <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My account</h1>
                <div className="m-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* LOGIN */}
                        <div>
                            <h2 className="text-2xl font-medium text-gray-900 mb-6">LOGIN</h2>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-md font-medium text-gray-700">
                                        Email address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm"
                                        disabled={loginMutation.isPending}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-md font-medium text-gray-700">
                                        Password <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded border border-gray-300 px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm"
                                        disabled={loginMutation.isPending}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded bg-[#8bc34a] px-4 py-2 text-white font-medium hover:bg-[#7fb440] transition disabled:opacity-50"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                                </button>

                                {loginMutation.isError && (
                                    <div className="text-red-600 text-sm">
                                        Login failed. Please check your credentials.
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center text-md">
                                        <input type="checkbox" className="mr-2" />
                                        Remember me
                                    </label>
                                    <a href="#" className="text-md text-[#8bc34a] hover:underline">
                                        Lost your password?
                                    </a>
                                </div>
                            </form>
                        </div>

                        {/* Register */}
                        <div className="border-l border-gray-200 pl-10 text-center">
                            <h2 className="text-2xl font-medium text-gray-900 mb-4">REGISTER</h2>
                            <p className="text-md text-gray-700 mb-6 leading-relaxed">
                                Registering for this site allows you to access your order status and history.
                                Just fill in the fields below, and we'll get a new account set up for you in no time.
                                We will only ask you for information necessary to make the purchase process faster and easier.
                            </p>

                            <button
                                onClick={() => router.push('/auth/register')}
                                className="rounded px-6 py-2 text-gray-900 font-medium hover:bg-gray-100 transition"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
