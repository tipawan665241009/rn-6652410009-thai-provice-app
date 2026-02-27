import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://gwhhesiyumlfgxiyzuxr.supabase.co';
const supabaseAnonKey = 'sb_publishable_M68kJP6ozBb0XdOdmbHBaw_W5YvGZfs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'provincial-assets';

export const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Fallback for external URLs
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
};
