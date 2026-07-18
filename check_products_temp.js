const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, weight, price, stock');
  
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  
  console.log("=== DATA PRODUK ===");
  console.log(JSON.stringify(data, null, 2));
}

checkProducts();
