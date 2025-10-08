-- Create the papers table
CREATE TABLE papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  answer_key JSONB NOT NULL,
  question_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);

-- Set up Row Level Security (RLS)
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo (you can restrict this later)
CREATE POLICY "Allow public access" ON papers FOR ALL USING (true);

-- Allow public access to storage
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs');
CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');