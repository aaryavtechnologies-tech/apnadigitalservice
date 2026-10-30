import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEFAULT_WEBSITE_CONTENT } from '../data/defaultWebsiteContent';

const STORAGE_KEY = 'apna_website_content';

/**
 * Deep merge helper to ensure defaults are preserved if specific keys are missing
 */
function deepMerge(target, source) {
  const output = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined && source[key] !== null) {
        output[key] = source[key];
      }
    });
  }
  return output;
}

/**
 * Get current website content from localStorage or defaults
 */
export function getLocalWebsiteContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_WEBSITE_CONTENT, parsed);
    }
  } catch (err) {
    console.error('Error reading website content from localStorage:', err);
  }
  return DEFAULT_WEBSITE_CONTENT;
}

/**
 * Fetch remote website content from Supabase and sync local cache
 */
export async function syncRemoteWebsiteContent() {
  const local = getLocalWebsiteContent();

  if (!isSupabaseConfigured || !supabase) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('section_key, content_data');

    if (!error && data && data.length > 0) {
      const remoteObject = {};
      data.forEach(row => {
        if (row.section_key && row.content_data) {
          let parsed = row.content_data;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              console.warn(`[syncRemoteWebsiteContent] String parse notice for ${row.section_key}:`, e);
            }
          }
          if (parsed && typeof parsed === 'object') {
            remoteObject[row.section_key] = parsed;
          }
        }
      });

      const merged = deepMerge(local, remoteObject);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.error(e);
      }
      return merged;
    }
  } catch (err) {
    console.warn('Supabase website_content fetch notice:', err);
  }

  return local;
}

/**
 * Save section content (Admin / Super Admin)
 * @param {string} sectionKey
 * @param {object} sectionData
 * @param {string} role
 */
export async function saveWebsiteSectionContent(sectionKey, sectionData, role) {
  if (role !== 'super_admin' && role !== 'admin') {
    return {
      success: false,
      error: 'Permission Denied: Only Admin can modify website contents.'
    };
  }

  try {
    const current = getLocalWebsiteContent();
    const updated = {
      ...current,
      [sectionKey]: {
        ...(current[sectionKey] || {}),
        ...sectionData
      }
    };

    // Sync to Supabase FIRST — it is the source of truth
    if (isSupabaseConfigured && supabase) {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('website_content')
        .upsert(
          [{ section_key: sectionKey, content_data: updated[sectionKey], updated_at: now }],
          { onConflict: 'section_key' }
        );

      if (error) {
        console.error('[saveWebsiteSectionContent] Supabase error:', error);
        return {
          success: false,
          error: `Database save failed: ${error.message}. Your changes were NOT saved.`
        };
      }
    }

    // Only update localStorage AFTER successful DB write
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('apna_content_changed', { detail: updated }));

    return { success: true, content: updated, savedKeys: [sectionKey] };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to save section content' };
  }
}

/**
 * Save multiple sections in one batch (used when saving an entire tab)
 * @param {Record<string, object>} sectionsMap
 * @param {string} role
 */
export async function saveWebsiteSectionsBatch(sectionsMap, role) {
  if (role !== 'super_admin' && role !== 'admin') {
    return {
      success: false,
      error: 'Permission Denied: Only Admin can modify website contents.'
    };
  }

  try {
    const current = getLocalWebsiteContent();
    const updated = { ...current };
    const upsertRows = [];
    const now = new Date().toISOString();

    for (const [key, data] of Object.entries(sectionsMap)) {
      updated[key] = {
        ...(current[key] || {}),
        ...data
      };
      upsertRows.push({
        section_key: key,
        content_data: updated[key],
        updated_at: now
      });
    }

    // Sync to Supabase FIRST
    if (isSupabaseConfigured && supabase && upsertRows.length > 0) {
      const { error } = await supabase
        .from('website_content')
        .upsert(upsertRows, { onConflict: 'section_key' });

      if (error) {
        console.error('[saveWebsiteSectionsBatch] Supabase error:', error);
        return {
          success: false,
          error: `Database save failed: ${error.message}. Your changes were NOT saved.`
        };
      }
    }

    // Update localStorage and trigger global app re-render
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('apna_content_changed', { detail: updated }));

    return { success: true, content: updated, savedKeys: Object.keys(sectionsMap) };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to save batch content' };
  }
}

/**
 * Reset a section to default website text
 */
export async function resetWebsiteSectionContent(sectionKey, role) {
  if (role !== 'super_admin' && role !== 'admin') {
    return {
      success: false,
      error: 'Permission Denied: Only Admin can reset website contents.'
    };
  }

  const defaultSection = DEFAULT_WEBSITE_CONTENT[sectionKey];
  if (!defaultSection) {
    return { success: false, error: 'Unknown section key' };
  }

  return await saveWebsiteSectionContent(sectionKey, defaultSection, role);
}

/**
 * React hook to consume website content in any component
 */
export function useWebsiteContent() {
  const [content, setContent] = useState(() => getLocalWebsiteContent());

  useEffect(() => {
    // Initial sync with remote Supabase
    syncRemoteWebsiteContent().then(fresh => {
      if (fresh) setContent(fresh);
    });

    const handleContentChanged = (e) => {
      if (e?.detail) {
        setContent(e.detail);
      } else {
        setContent(getLocalWebsiteContent());
      }
    };

    window.addEventListener('apna_content_changed', handleContentChanged);
    return () => window.removeEventListener('apna_content_changed', handleContentChanged);
  }, []);

  return { content, getLocalWebsiteContent };
}
