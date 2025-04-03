import AppleLayout from '@/components/AppleLayout'
import Layout from '../components/Layout'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <AppleLayout>
      <Component {...pageProps} />
    </AppleLayout>
  )
}

export default MyApp