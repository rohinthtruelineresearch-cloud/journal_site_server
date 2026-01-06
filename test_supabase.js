const supabase = require('./utils/supabase');
const dotenv = require('dotenv');
dotenv.config();

async function testSupabase() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'journal-files';
  
  console.log('Testing Supabase Connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Bucket:', bucketName);

  const { data, error } = await supabase.storage.getBucket(bucketName);

  if (error) {
    if (error.message.includes('not found')) {
      console.log(`Bucket "${bucketName}" not found. Attempting to create...`);
      const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError.message);
      } else {
        console.log('Bucket created successfully!');
      }
    } else {
      console.error('Error fetching bucket:', error.message);
    }
  } else {
    console.log('Bucket already exists and is accessible!');
  }
}

testSupabase();
