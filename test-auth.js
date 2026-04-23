const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('"https://cilzsacpdakipjsgxgji.supabase.co"', '"sb_publishable_yQyAJEeYyf34c9KT2GiZbQ_bFKvxW-v"');

async function test() {
  const email = 'testuser' + Date.now() + '@example.com';
  console.log('Testing SignUp with', email);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
  });
  
  if (error) {
    console.error('SignUp Error:', error.message);
  } else {
    console.log('SignUp Success:', !!data.user);
    console.log('Needs Email Confirmation?', !data.session);
  }
}
test();
