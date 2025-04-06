import AppleLayout from '@/components/AppleLayout'
import Layout from '../components/Layout'
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
  return (
    // <ThemeProvider attribute="class">
      <AppleLayout>
        <Component {...pageProps} />
      </AppleLayout>
    // </ThemeProvider>
  )
}

export default MyApp