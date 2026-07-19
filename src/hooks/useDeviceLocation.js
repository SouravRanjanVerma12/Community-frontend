import { useEffect } from 'react';
import api from '../api/axiosInstance';

const SYNC_KEY = 'geo:lastSync';
const SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // refresh weekly

// Free, keyless reverse geocode (coords -> "City, Country" label).
async function reverseGeocode(latitude, longitude) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  if (!res.ok) return '';
  const d = await res.json();
  const city = d.city || d.locality || d.principalSubdivision;
  return city && d.countryName ? `${city}, ${d.countryName}` : '';
}

// Free, keyless IP-based lookup — city-level accuracy, used when the user
// denies (or the device lacks) precise geolocation.
async function ipLookup() {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) return null;
  const d = await res.json();
  if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return null;
  return {
    latitude: d.latitude,
    longitude: d.longitude,
    label: d.city && d.country_name ? `${d.city}, ${d.country_name}` : '',
  };
}

/* Captures the device's location after login and syncs it to the backend for
   the nearby-posts feed signal: browser geolocation (native permission popup)
   first, silent IP-based lookup as the fallback. Coordinates are rounded to
   ~1km before they leave the device; re-syncs at most weekly. */
export function useDeviceLocation(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const lastSync = Number(localStorage.getItem(SYNC_KEY) || 0);
    if (Date.now() - lastSync < SYNC_INTERVAL_MS) return;

    let cancelled = false;

    const send = async ({ latitude, longitude, label }) => {
      if (cancelled) return;
      await api.post('/users/location', {
        latitude: Math.round(latitude * 100) / 100,
        longitude: Math.round(longitude * 100) / 100,
        locationLabel: label ?? '',
      });
      localStorage.setItem(SYNC_KEY, String(Date.now()));
    };

    const viaIp = async () => {
      try {
        const loc = await ipLookup();
        if (loc && !cancelled) await send(loc);
      } catch { /* location stays as-is — feed falls back to the profile string */ }
    };

    if (!('geolocation' in navigator)) {
      viaIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          let label = '';
          try { label = await reverseGeocode(latitude, longitude); } catch { /* label optional */ }
          await send({ latitude, longitude, label });
        } catch { /* non-fatal */ }
      },
      () => viaIp(), // denied / unavailable / timeout
      { timeout: 8000, maximumAge: 60 * 60 * 1000 }
    );

    return () => { cancelled = true; };
  }, [enabled]);
}
