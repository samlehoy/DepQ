import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEV_EMAIL,
    password: process.env.VITE_DEV_PASSWORD
  });
  
  if (error) {
    console.error('Login error:', error.message);
    return;
  }
  
  console.log('Logged in as:', data.user.email);
  console.log('Current metadata:', data.user.user_metadata);
  
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    data: { full_name: 'Muttaqien Updated' }
  });
  
  if (updateError) {
    console.error('Update error:', updateError.message);
  } else {
    console.log('Update success! New metadata:', updateData.user.user_metadata);
  }
}

test();
