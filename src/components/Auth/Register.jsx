'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useContext } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AuthContext } from '@/context/AuthContext'

export default function Register() {
    const router = useRouter()
    const { user, isAuthLoading } = useContext(AuthContext)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        mobile: '',
        company_name: '',
        country_id: 1,
        address: '',
        port: '',
        commercial_register: '',
        communication_email: '',
        image: null,
        device_token: 'token_abc123',
        role: 'agent'
    })

    const [validationErrors, setValidationErrors] = useState({})

    useEffect(() => {
        if (!isAuthLoading && user) {
            router.push('/')
        }
    }, [user, isAuthLoading, router])

    const handleChange = (e) => {
        const { name, value, type, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }))
    }

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            setValidationErrors({})

            const formDataObj = new FormData()

            Object.keys(data).forEach(key => {
                if (key === 'image' && data[key]) {
                    formDataObj.append('image', data[key])
                } else {
                    formDataObj.append(key, data[key])
                }
            })

            formDataObj.append('is_approved', true)

            console.group('📤 FormData being submitted:')
            for (const pair of formDataObj.entries()) {
                console.log(`${pair[0]}:`, pair[1])
            }
            console.groupEnd()

            try {
                const response = await axios.post(
                    'https://st.amjadshbib.com/api/registeragent',
                    formDataObj,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                console.log('✅ API response:', response.data)
                return response.data
            } catch (error) {
                console.error('❌ Registration API error:', error)
                throw error
            }
        },

        onSuccess: (data, variables) => {
            toast.success('Registration successful! Please verify your email.')
            localStorage.setItem('registeredEmail', variables.email)
            router.push('/auth/verify-email')
        },

        onError: (error) => {
            console.error('❌ onError triggered')

            if (error.response) {
                const { status, data, headers, config } = error.response

                console.group('🔴 Axios Error Response')
                console.log('Status:', status)
                console.log('Data:', data)
                console.log('Headers:', headers)
                console.log('Config:', config)
                console.groupEnd()

                if (status === 422 && data.message === 'Validation errors' && data.data) {
                    setValidationErrors(data.data)

                    if (data.data.email === 'This email is registered but not verified.') {
                        toast.info('This email is registered but not verified. Redirecting...')
                        localStorage.setItem('registeredEmail', formData.email)
                        setTimeout(() => {
                            router.push('/auth/verify-email')
                        }, 2000)
                        return
                    }

                    const errorMessages = Object.values(data.data).join(', ')
                    toast.error(`Validation errors: ${errorMessages}`)
                } else if (status === 500) {
                    toast.error('Server error. Please try again later.')
                } else {
                    toast.error(data.message || 'Registration failed. Please try again.')
                }
            } else if (error.request) {
                console.error('🟠 No response received:', error.request)
                toast.error('Network error. Please check your connection.')
            } else {
                console.error('🟡 Unexpected error:', error.message)
                toast.error('Unexpected error. Try again.')
            }
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        const processedData = {
            ...formData,
            country_id: parseInt(formData.country_id, 10)
        }

        const requiredFields = [
            'name', 'email', 'password', 'password_confirmation',
            'phone', 'mobile', 'company_name', 'port', 'address', 'country_id'
        ]
        const missingFields = requiredFields.filter(field => !processedData[field])
        if (missingFields.length > 0) {
            toast.error(`Please fill: ${missingFields.join(', ')}`)
            return
        }

        if (processedData.password !== processedData.password_confirmation) {
            toast.error('Passwords do not match')
            return
        }

        registerMutation.mutate(processedData)
    }
    return (
        <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My account</h1>
                <div className="m-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Register */}
                        <div>
                            <h2 className="text-2xl font-medium text-gray-900 mb-6">REGISTER</h2>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="name" className="block text-md font-medium text-gray-700">
                                        Name <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-md font-medium text-gray-700">
                                        Email address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                    )}
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
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-md font-medium text-gray-700">
                                        Confirm Password <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.password_confirmation}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-md font-medium text-gray-700">
                                        Phone number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                        placeholder="+963xxxxxxxxx"
                                    />
                                    {validationErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="mobile" className="block text-md font-medium text-gray-700">
                                       Mobile <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="mobile"
                                        name="mobile"
                                        type="text"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.mobile ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                        placeholder="09xxxxxxxx"
                                    />
                                    {validationErrors.mobile && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.mobile}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="company_name" className="block text-md font-medium text-gray-700">
                                        Company name <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        required
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.company_name ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.company_name && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.company_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="port" className="block text-md font-medium text-gray-700">
                                        Port <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="port"
                                        name="port"
                                        type="text"
                                        required
                                        value={formData.port}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.port ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.port && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.port}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-md font-medium text-gray-700">
                                        Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.address ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.address && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="commercial_register" className="block text-md font-medium text-gray-700">
                                        Commercial Register
                                    </label>
                                    <input
                                        id="commercial_register"
                                        name="commercial_register"
                                        type="text"
                                        value={formData.commercial_register}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.commercial_register ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.commercial_register && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.commercial_register}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="communication_email" className="block text-md font-medium text-gray-700">
                                        Communication Email
                                    </label>
                                    <input
                                        id="communication_email"
                                        name="communication_email"
                                        type="email"
                                        value={formData.communication_email}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.communication_email ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.communication_email && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.communication_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="image" className="block text-md font-medium text-gray-700">
                                        Profile Image
                                    </label>
                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.image ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    />
                                    {validationErrors.image && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="country_id" className="block text-md font-medium text-gray-700">
                                        Country <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        id="country_id"
                                        name="country_id"
                                        required
                                        value={formData.country_id}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded border ${validationErrors.country_id ? 'border-red-500' : 'border-gray-300'} px-4 py-2 shadow-sm focus:border-[#8bc34a] focus:ring-[#8bc34a] sm:text-sm`}
                                        disabled={registerMutation.isPending}
                                    >
                                        <option value="1">Syria</option>
                                        <option value="2">Turkey</option>
                                        <option value="3">UAE</option>
                                        <option value="4">Saudi Arabia</option>
                                        {/* Add more countries as needed */}
                                    </select>
                                    {validationErrors.country_id && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.country_id}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded bg-[#8bc34a] px-4 py-2 text-white font-medium hover:bg-[#7fb440] transition disabled:opacity-50"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? 'Registering...' : 'Register'}
                                </button>
                                
                                {registerMutation.isError && (
                                    <div className="text-red-600 text-sm">
                                        Registration failed. Please check your information and try again.
                                    </div>
                                )}

                                <div className="flex items-center justify-center">
                                    <a href="/auth/login" className="text-md text-[#8bc34a] hover:underline">
                                        Already have an account? Login
                                    </a>
                                </div>
                            </form>
                        </div>

                        {/* Information */}
                        <div className="border-l border-gray-200 pl-10 text-center">
                            <h2 className="text-2xl font-medium text-gray-900 mb-4">BECOME AN AGENT</h2>
                            <p className="text-md text-gray-700 mb-6 leading-relaxed">
                                Registering as an agent for Setalkel allows you to access exclusive features and benefits:
                            </p>
                            <ul className="text-left text-md text-gray-700 mb-6 space-y-2">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-[#8bc34a] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Access to wholesale pricing</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-[#8bc34a] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Bulk ordering capabilities</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-[#8bc34a] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Dedicated customer support</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-[#8bc34a] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Early access to new products</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-[#8bc34a] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Exclusive promotional offers</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => router.push('/auth/login')}
                                className="rounded px-6 py-2 text-gray-900 font-medium hover:bg-gray-100 transition border border-gray-300"
                            >
                                Already have an account? Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

