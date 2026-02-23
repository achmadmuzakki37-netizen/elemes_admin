'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, User } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import Image from 'next/image'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rememberMe, setRememberMe] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            setError((err as Error).message || 'Authentication failed. Please check your credentials.')
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-white text-slate-900 font-sans">
            {/* Left Column: Visual (55%) */}
            <div className="hidden lg:flex w-full lg:w-[55%] relative overflow-hidden bg-zinc-950 items-center justify-center p-12">
                {/* Abstract Solid Shapes (No Gradients) */}
                <div className="absolute top-1/4 -right-12 w-64 h-64 bg-emerald-500 rounded-full opacity-20 blur-sm"></div>
                <div className="absolute -bottom-24 left-1/4 w-[400px] h-32 bg-emerald-600 rounded-full -rotate-45 opacity-60"></div>
                <div className="absolute -bottom-12 left-1/3 w-[300px] h-24 bg-emerald-400 rounded-full -rotate-45 opacity-40"></div>
                <div className="absolute bottom-24 left-1/2 w-[250px] h-20 bg-emerald-700 rounded-full -rotate-45 opacity-80"></div>
                <div className="absolute bottom-12 right-1/4 w-[200px] h-16 bg-emerald-500 rounded-full -rotate-45 opacity-60"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <div className="flex items-center gap-3 mb-8">
                        {/* Branding Icon */}
                        <div className="bg-white p-2 rounded-xl">
                            <Image src="/favicon.ico" alt="Favicon" width={32} height={32} className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-xl tracking-wider text-emerald-400">ADMIN GESIT</span>
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
                        Welcome to <br />
                        <span className="text-emerald-400">LMS Portal</span>
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                        Kelola program pelatihan, lacak kemajuan pengguna, dan terbitkan konten pendidikan dengan lancar melalui LMS GESIT.
                    </p>
                </div>
            </div>

            {/* Right Column: Form (45%) */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative z-20">
                <div className="w-full max-w-sm mx-auto">

                    <div className="text-center mb-10">
                        <div className="lg:hidden flex justify-center items-center gap-3 mb-6">
                            <div className="bg-zinc-950 p-2 rounded-xl">
                                <Image src="/favicon.ico" alt="Favicon" width={32} height={32} className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-xl tracking-wider text-zinc-950">ADMIN GESIT</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-wide uppercase">Login</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Email Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-700 rounded-full outline-none placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-700 rounded-full outline-none placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-sm px-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <svg className={`absolute w-3 h-3 text-white pointer-events-none ${rememberMe ? 'opacity-100' : 'opacity-0'} transition-opacity`} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span>Remember</span>
                            </label>

                            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                className="w-full max-w-[200px] h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold tracking-wide rounded-full transition-all shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        LOGGING IN...
                                    </>
                                ) : (
                                    'LOGIN'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
