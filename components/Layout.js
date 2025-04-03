import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    FaHome,
    FaWallet,
    FaTags,
    FaChartPie,
    FaCog,
    FaBars,
    FaTimes
} from 'react-icons/fa'

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()

    // Close mobile menu when route changes
    useEffect(() => {
        const handleRouteChange = () => setIsMobileMenuOpen(false)
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => router.events.off('routeChangeComplete', handleRouteChange)
    }, [router])

    const navItems = [
        { href: "/", icon: <FaHome />, text: "Beranda" },
        { href: "/wallets", icon: <FaWallet />, text: "Dompet" },
        { href: "/categories", icon: <FaTags />, text: "Kategori" },
        { href: "/statistics", icon: <FaChartPie />, text: "Statistik" },
        { href: "/settings", icon: <FaCog />, text: "Pengaturan" }
    ]

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-blue-600">MyFinance</h1>
                </div>
                <nav className="flex-1 p-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center p-3 rounded-lg mb-1 ${router.pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span>{item.text}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Header (hidden on desktop) */}
            <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
                <h1 className="text-xl font-bold text-blue-600">MyFinance</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </header>

            {/* Mobile Menu (hidden on desktop) */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-white">
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h1 className="text-xl font-bold">Menu</h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <nav className="flex-1 p-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg mb-1 ${router.pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.text}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 pb-16 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation (hidden on desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-40">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center ${router.pathname === item.href ? 'text-blue-500' : 'text-gray-500'}`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs mt-1">{item.text}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}