const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserProfile() {
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    return;
  }
  
  console.log("=== DATA PROFIL USER ===");
  console.log(JSON.stringify(profiles, null, 2));
}

checkUserProfile();
