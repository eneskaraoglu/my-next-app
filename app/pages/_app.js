import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && router.pathname !== '/login') {
      router.push('/login'); // Login sayfasına yönlendir
    }
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
