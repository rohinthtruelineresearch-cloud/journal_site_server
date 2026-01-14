/**
 * Migration Script: Add Author Roles to Existing Articles
 * 
 * This script updates all existing articles in the database to include
 * author role classifications (First Author, Second Author, etc.)
 */

const mongoose = require('mongoose');
const Article = require('./models/Article');
require('dotenv').config();

// Role mapping for author positions
const roleMap = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 
  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'
];

function getAuthorRole(position) {
  if (position <= roleMap.length) {
    return `${roleMap[position - 1]} Author`;
  }
  return `Author ${position}`;
}

async function migrateAuthorRoles() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all articles
    console.log('📚 Fetching all articles...');
    const articles = await Article.find({});
    console.log(`✅ Found ${articles.length} articles\n`);

    if (articles.length === 0) {
      console.log('ℹ️  No articles to migrate.');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    console.log('🔄 Starting migration...\n');

    for (const article of articles) {
      let needsUpdate = false;

      // Check if article has authors array
      if (Array.isArray(article.authors) && article.authors.length > 0) {
        // Update each author with their role
        article.authors.forEach((author, index) => {
          const position = index + 1;
          const authorRole = getAuthorRole(position);

          // Only update if authorRole is missing or empty
          if (!author.authorRole) {
            author.authorRole = authorRole;
            needsUpdate = true;
          }
        });

        if (needsUpdate) {
          await article.save();
          updatedCount++;
          console.log(`✅ Updated: "${article.title.substring(0, 60)}..."`);
          console.log(`   Authors updated: ${article.authors.length}`);
          console.log(`   Roles assigned: ${article.authors.map(a => a.authorRole).join(', ')}\n`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped: "${article.title.substring(0, 60)}..." (already has roles)\n`);
        }
      } else {
        skippedCount++;
        console.log(`⚠️  Skipped: "${article.title.substring(0, 60)}..." (no authors array)\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total articles processed: ${articles.length}`);
    console.log(`✅ Articles updated: ${updatedCount}`);
    console.log(`⏭️  Articles skipped: ${skippedCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed with error:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the migration
console.log('\n' + '='.repeat(60));
console.log('🚀 Author Role Migration Script');
console.log('='.repeat(60) + '\n');

migrateAuthorRoles()
  .then(() => {
    console.log('👋 Exiting...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
