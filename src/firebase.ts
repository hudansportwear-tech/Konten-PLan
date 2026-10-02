import { ContentPlanItem, BrandSettings } from './types/content';

/**
 * Cloud Storage Adapter:
 * Persists application state, content plans, todos, and evaluations
 * directly to the server cloud database, with automatic local fallback.
 */

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return Boolean(data.status === 'ok');
  } catch (err) {
    console.warn('Server connection notice:', err);
    return false;
  }
}

// Fetch all content plans from cloud
export async function fetchContentFromCloud(): Promise<ContentPlanItem[] | null> {
  try {
    const res = await fetch('/api/storage/content');
    if (!res.ok) return null;
    const data = await res.json();
    return data.items || null;
  } catch (err) {
    console.warn('Cloud fetch content error:', err);
    return null;
  }
}

// Save all content plans to cloud
export async function saveContentToCloud(items: ContentPlanItem[]): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud save content error:', err);
    return false;
  }
}

// Fetch brand settings from cloud
export async function fetchBrandFromCloud(): Promise<BrandSettings | null> {
  try {
    const res = await fetch('/api/storage/brand');
    if (!res.ok) return null;
    const data = await res.json();
    return data.brand || null;
  } catch (err) {
    console.warn('Cloud fetch brand error:', err);
    return null;
  }
}

// Save brand settings to cloud
export async function saveBrandToCloud(brand: BrandSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud save brand error:', err);
    return false;
  }
}

// Backwards compatibility wrappers
export async function saveContentOnline(_item: ContentPlanItem): Promise<void> {
  // Sync is handled atomically via saveContentToCloud
}

export async function deleteContentOnline(_contentId: string): Promise<void> {
  // Sync is handled atomically via saveContentToCloud
}

export async function saveBrandSettingsOnline(settings: BrandSettings): Promise<void> {
  await saveBrandToCloud(settings);
}
