#!/usr/bin/env node

console.log('🧪 TEST DIAGNOSTIC PACKAGE');

try {
  const cred = require('./dist/credentials/TestCredential.credentials.js');
  const node = require('./dist/nodes/Test/Test.node.js');
  
  console.log('✅ Credential loaded:', typeof cred.class);
  console.log('✅ Node loaded:', typeof node.class);
  
  const credInstance = new cred.class();
  const nodeInstance = new node.class();
  
  console.log('✅ Credential instantiated:', credInstance.name);
  console.log('✅ Node instantiated:', nodeInstance.description.name);
  
  console.log('🎉 DIAGNOSTIC PACKAGE OK');
} catch (error) {
  console.log('❌ ERROR:', error.message);
}
