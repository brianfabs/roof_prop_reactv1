/**
 * Enhanced debug function to check Firebase Auth state and permissions
 */
async function debugFirebaseAuth() {
  console.log('=== FIREBASE AUTH DEBUG ===');
  
  try {
    // Check if Firebase Auth is being used
    if (firebase.auth) {
      const currentUser = firebase.auth().currentUser;
      console.log('Firebase Auth current user:', currentUser);
      
      if (currentUser) {
        console.log('User UID:', currentUser.uid);
        console.log('User Email:', currentUser.email);
        
        // Get the ID token to check claims
        const token = await currentUser.getIdToken();
        console.log('User has valid token:', !!token);
      } else {
        console.log('No Firebase Auth user signed in');
        
        // Try to sign in anonymously for testing
        console.log('Attempting anonymous sign-in...');
        const result = await firebase.auth().signInAnonymously();
        console.log('Anonymous sign-in successful:', result.user.uid);
      }
    } else {
      console.log('Firebase Auth not initialized');
    }
    
    // Test permissions with a dummy write
    console.log('Testing write permissions...');
    const testRef = firebase.firestore().collection('proposals').doc('test-permission');
    await testRef.set({
      test: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Write permission test successful');
    
    // Clean up test document
    await testRef.delete();
    console.log('✓ Test document cleaned up');
    
  } catch (error) {
    console.error('Firebase Auth Debug Error:', error);
    displayDetailedError(error, 'Firebase Auth Debug');
  }
  
  console.log('========================');
}

// Add this to your window object
window.debugFirebaseAuth = debugFirebaseAuth;