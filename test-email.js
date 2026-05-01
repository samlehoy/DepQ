import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEV_EMAIL,
    password: 'newpassword123'
  });
  
  if (error) { console.error('login error:', error.message); return; }
  
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    email: 'anothertest123@gmail.com'
  });
  
  if (updateError) {
    console.error('Update email error:', updateError.message);
  } else {
    console.log('Email Update success! Check if email changed:', updateData.user.email);
  }
}

test();
