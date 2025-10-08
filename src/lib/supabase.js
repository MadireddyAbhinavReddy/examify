import {
  createClient
} from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const {
      data,
      error
    } = await supabase.from('papers').select('count', {
      count: 'exact',
      head: true
    });
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

// Helper functions for file operations
export const uploadPDF = async (file, filename) => {
  try {
    console.log('📤 Supabase Storage: Uploading', filename, 'to pdfs bucket');
    const {
      data,
      error
    } = await supabase.storage
      .from('pdfs')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Supabase Storage Error:', error);
      throw error;
    }

    console.log('✅ Supabase Storage: Upload successful', data);
    return data
  } catch (error) {
    console.error('❌ Error uploading PDF:', error)
    throw error
  }
}

export const getPDFUrl = async (filename) => {
  try {
    const {
      data
    } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filename)

    return data.publicUrl
  } catch (error) {
    console.error('Error getting PDF URL:', error)
    throw error
  }
}

export const savePaper = async (paperData) => {
  try {
    console.log('💾 Supabase Database: Inserting paper data into papers table');
    const {
      data,
      error
    } = await supabase
      .from('papers')
      .insert([paperData])
      .select()

    if (error) {
      console.error('❌ Supabase Database Error:', error);
      throw error;
    }

    console.log('✅ Supabase Database: Insert successful', data[0]);
    return data[0]
  } catch (error) {
    console.error('❌ Error saving paper:', error)
    throw error
  }
}

export const getPapers = async () => {
  try {
    const {
      data,
      error
    } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', {
        ascending: false
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting papers:', error)
    throw error
  }
}

export const getPaper = async (id) => {
  try {
    const {
      data,
      error
    } = await supabase
      .from('papers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting paper:', error)
    throw error
  }
}