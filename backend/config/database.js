
const { supabase } = require('./supabaseClient');

const connectDB = async () => {
  try {
    const { data, error } = await supabase.from('skills_catalog').select('count');
    
    if (error) {
      throw new Error(`Error connecting to Supabase: ${error.message}`);
    }
    
    console.log('Supabase connection successful');
  } catch (error) {
    console.error(`Error connecting to Supabase: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
