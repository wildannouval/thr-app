import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    HiHome,
    HiCreditCard,
    HiTag,
    HiChartBar,
    HiCog,
    HiMenu,
    HiX
} from 'react-icons/hi'
import ThemeSwitcher from './ThemeSwitcher'

export default function AppleLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleRouteChange = () => setIsMobileMenuOpen(false)
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => router.events.off('routeChangeComplete', handleRouteChange)
    }, [router])

    const navItems = [
        { href: "/", icon: <HiHome size={22} />, text: "Beranda" },
        { href: "/wallets", icon: <HiCreditCard size={22} />, text: "Dompet" },
        { href: "/categories", icon: <HiTag size={22} />, text: "Kategori" },
        { href: "/statistics", icon: <HiChartBar size={22} />, text: "Analisis" },
        { href: "/settings", icon: <HiCog size={22} />, text: "Pengaturan" }
    ]

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
            {/* Desktop Sidebar - Apple Style */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 pb-4">
                    <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                        Tabungané
                    </h1>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 ${router.pathname === item.href
                                    ? 'bg-blue-500/10 text-blue-600'
                                    : 'hover:bg-gray-100/50 text-gray-700'
                                }`}
                        >
                            <span className={`mr-3 ${router.pathname === item.href ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.text}</span>
                        </Link>
                    ))}
                {/* <ThemeSwitcher /> */}
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm border-b border-gray-200/80">
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Tabungané</h1>
                {/* Button Menu Samping Kanan Atas Mobile */}
                {/* <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                    {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button> */}
            </header>

            {/* Mobile Menu - Sheet Style */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white/90 backdrop-blur-xl shadow-xl">
                        <div className="p-5 border-b border-gray-200/50 flex justify-between items-center">
                            <h1 className="text-xl font-semibold">Menu</h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <HiX size={20} />
                            </button>
                        </div>
                        <nav className="p-2 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center p-4 rounded-xl mx-2 ${router.pathname === item.href
                                            ? 'bg-blue-500/10 text-blue-600'
                                            : 'hover:bg-gray-100/50'
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span className="font-medium">{item.text}</span>
                                </Link>
                            ))}
                            {/* <ThemeSwitcher /> */}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-5 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation - Tab Bar Style */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/80 flex justify-around py-3 z-40">
                {navItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center p-1 ${router.pathname === item.href ? 'text-blue-500' : 'text-gray-500'
                            }`}
                    >
                        <span className={`p-2 rounded-full ${router.pathname === item.href ? 'bg-blue-500/10' : ''
                            }`}>
                            {item.icon}
                        </span>
                        <span className="text-xs mt-1">{item.text}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}