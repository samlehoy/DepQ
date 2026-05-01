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
    password: 'newpassword123'
  });
  
  if (updateError) {
    console.error('Update error:', updateError.message);
  } else {
    console.log('Password Update success!');
  }
}

test();
