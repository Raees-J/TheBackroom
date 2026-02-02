/**
 * Add Test User to Database
 * Run this to add your phone number for testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addTestUser() {
  const phoneNumber = '+27604784145'; // Your number
  const testOTP = '123456'; // Fixed OTP for testing
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  console.log('Adding test user to database...');
  console.log('Phone:', phoneNumber);
  console.log('Test OTP:', testOTP);

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('User ID:', existingUser.id);
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            phone_number: phoneNumber,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('❌ Error creating user:', userError);
        return;
      }

      console.log('✅ User created!');
      console.log('User ID:', newUser.id);
    }

    // Add OTP code
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .insert([
        {
          phone_number: phoneNumber,
          code: testOTP,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (otpError) {
      console.error('❌ Error creating OTP:', otpError);
      return;
    }

    console.log('✅ OTP code added!');
    console.log('\n🎉 SUCCESS! You can now sign in with:');
    console.log('   Phone: 060 478 4145');
    console.log('   OTP: 123456');
    console.log('\n   This OTP is valid for 24 hours.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestUser();
