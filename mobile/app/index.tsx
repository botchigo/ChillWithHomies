import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Safe redirect after the root layout mounts
    router.replace('/signin');
  }, []);

  return null;
}
