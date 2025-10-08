import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for file operations
export const uploadPDF = async (file, filename) => {
  try {
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading PDF:', error)
    throw error
  }
}

export const getPDFUrl = async (filename) => {
  try {
    const { data } = supabase.storage
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
    const { data, error } = await supabase
      .from('papers')
      .insert([paperData])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving paper:', error)
    throw error
  }
}

export const getPapers = async () => {
  try {
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting papers:', error)
    throw error
  }
}

export const getPaper = async (id) => {
  try {
    const { data, error } = await supabase
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