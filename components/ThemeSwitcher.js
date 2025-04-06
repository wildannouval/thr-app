// components/ThemeSwitcher.js
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme(); // resolvedTheme berguna jika tema 'system'

    // useEffect hanya berjalan di sisi klien
    // Ini penting untuk menghindari hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Jangan render apapun di server atau saat hidrasi awal
        // untuk mencegah ketidakcocokan UI antara server dan klien
        return null;
    }

    const handleThemeChange = () => {
        // Mengganti antara terang dan gelap
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    // Atau, jika Anda ingin tombol terpisah atau dropdown:
    // const handleSetLight = () => setTheme('light');
    // const handleSetDark = () => setTheme('dark');
    // const handleSetSystem = () => setTheme('system');

    return (
        <div>
            {/* Contoh tombol toggle sederhana */}
            <button
                onClick={handleThemeChange}
                className="px-3 py-1 border rounded dark:border-gray-600" // Contoh styling sederhana
            >
                {/* Tampilkan ikon atau teks berdasarkan tema saat ini */}
                Mode Saat Ini: {resolvedTheme === 'dark' ? '🌙 Gelap' : '☀️ Terang'} (Ganti)
            </button>
        </div>
    );
};

export default ThemeSwitcher;