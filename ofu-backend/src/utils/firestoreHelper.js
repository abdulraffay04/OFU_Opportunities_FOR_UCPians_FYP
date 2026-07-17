// This file provides reusable helper functions for Firestore database operations.
// Use these instead of writing Firestore queries directly in your controllers.

const { db } = require('../config/firebase');

// Get a single document from a collection by its ID
async function getDocument(collection, id) {
  const docRef = db.collection(collection).doc(id);
  const doc = await docRef.get();

  // Return null if the document does not exist
  if (!doc.exists) {
    return null;
  }

  // Return the document data along with its ID
  const documentData = doc.data();
  documentData.id = doc.id;
  return documentData;
}

// Create a new document in a collection (auto-generates an ID)
async function createDocument(collection, data) {
  // Add timestamps to the data
  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();

  const docRef = await db.collection(collection).add(data);

  // Return the data with the new auto-generated ID
  data.id = docRef.id;
  return data;
}

// Update an existing document in a collection by its ID
async function updateDocument(collection, id, data) {
  const docRef = db.collection(collection).doc(id);

  // Add the updated timestamp
  data.updatedAt = new Date().toISOString();

  await docRef.update(data);

  // Return the updated data with the ID
  data.id = id;
  return data;
}

// Delete a document from a collection by its ID
async function deleteDocument(collection, id) {
  const docRef = db.collection(collection).doc(id);
  await docRef.delete();
  return { id: id };
}

// Query a collection with optional filters, ordering, and limit
// filters is an array of objects like: { field: 'status', operator: '==', value: 'active' }
// orderBy is an object like: { field: 'createdAt', direction: 'desc' }
// limitCount is a number like: 10
async function queryCollection(collection, filters, orderBy, limitCount) {
  let query = db.collection(collection);

  // Apply each filter if filters are provided
  if (filters && filters.length > 0) {
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      query = query.where(filter.field, filter.operator, filter.value);
    }
  }

  // Apply ordering if provided
  if (orderBy) {
    const direction = orderBy.direction || 'asc';
    query = query.orderBy(orderBy.field, direction);
  }

  // Apply limit if provided
  if (limitCount) {
    query = query.limit(limitCount);
  }

  // Execute the query and collect results
  const snapshot = await query.get();
  const results = [];

  snapshot.forEach(function (doc) {
    const documentData = doc.data();
    documentData.id = doc.id;
    results.push(documentData);
  });

  return results;
}

module.exports = {
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  queryCollection,
};
