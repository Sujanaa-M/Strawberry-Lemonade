import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project-ref') &&
  !SUPABASE_ANON_KEY.includes('your-anon-api-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '%c🍓 Strawberry Lemonade - Supabase Sync: Offline Mode (Local Storage only).\nAdd VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable cloud sync.',
    'color: #DA5576; font-weight: bold;'
  );
}

/**
 * Save / Upsert a completed task with metadata into the Supabase database
 * @param {Object} task - The task object { id, text, category, completed, createdAt }
 * @param {Object} extraMetadata - Additional custom metadata if any
 */
export async function syncCompletedTaskToSupabase(task, extraMetadata = {}) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const payload = {
      id: task.id,
      text: task.text,
      category: task.category || 'personal',
      completed: Boolean(task.completed),
      completed_at: new Date().toISOString(),
      created_at: task.createdAt || new Date().toISOString(),
      metadata: {
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        completedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        source: 'Strawberry-Lemonade-Web',
        ...extraMetadata
      }
    };

    const { data, error } = await supabase
      .from('completed_tasks')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Error syncing completed task to Supabase:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Network error syncing completed task to Supabase:', err);
    return null;
  }
}

/**
 * Remove or mark uncompleted a task in Supabase
 * @param {string} taskId
 */
export async function removeCompletedTaskFromSupabase(taskId) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('completed_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.warn('Error deleting task from Supabase:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Network error deleting task from Supabase:', err);
    return null;
  }
}

/**
 * Fetch all historical completed tasks from Supabase
 */
export async function fetchCompletedTasksFromSupabase(limit = 100) {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('completed_tasks')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching completed tasks from Supabase:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Network error fetching completed tasks from Supabase:', err);
    return [];
  }
}
