import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEV_EMAIL,
    password: process.env.VITE_DEV_PASSWORD
  });
  
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    email: 'anothertest123@gmail.com',
    data: { full_name: 'Muttaqien Test 2' }
  });
  
  if (updateError) {
    console.error('Update error:', updateError.message);
  } else {
    console.log('Update success! Check if full_name changed:', updateData.user.user_metadata.full_name);
  }
}

test();
