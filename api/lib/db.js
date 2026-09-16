/** MongoDB integration was retired in favor of Firestore. */
export async function getDb() {
  throw new Error('MongoDB endpoint retired');
}
