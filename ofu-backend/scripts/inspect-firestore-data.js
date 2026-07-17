// Temporary read-only inspection script, not part of the actual application
const { db } = require('../src/config/firebase');

async function inspectData() {
  const collections = [
    'users',
    'opportunities',
    'applications',
    'saved', // often used for savedOpportunities
    'alumniProfiles',
    'resumeReports',
    'chatbotLogs',
    'adminLogs'
  ];

  for (const collectionName of collections) {
    console.log(`\n=== Collection: ${collectionName} ===`);
    try {
      const snapshot = await db.collection(collectionName).limit(2).get();
      if (snapshot.empty) {
        console.log('No documents found');
      } else {
        snapshot.forEach(doc => {
          console.log(`Document ID: ${doc.id}`);
          console.log(JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (error) {
      console.log('No documents found (or error occurred):', error.message);
    }
  }

  process.exit(0);
}

inspectData();
