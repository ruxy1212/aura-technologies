const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8007';

export async function wakeServer() {
  try {
    await fetch(`${BASE}/health`);
  } catch {
    // fire-and-forget — ignore errors
  }
}

export async function pollServer(setError) {
  const MAX_RETRIES = 10;
  const INTERVAL_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt === 1) setError('Waiting for the compose server to wake up.');

    if (attempt === MAX_RETRIES) setError('Compose server did not respond in time. Please try again shortly.')

    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data?.status === 'ok' && data?.bundleReady === true) {
          return true;
        }
      }
    } catch {
      // server not up yet, continue polling
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
  }

  return false;
}