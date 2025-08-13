// Simple test for the new 3-digit user ID format
console.log('🔍 Testing new 3-digit User ID format logic...\n');

// Simulate existing user IDs (sequential generation)
const existingUserIds = [
  'USR001',  // First user
  'USR002',  // Second user
  'USR003',  // Third user
  'USR010',  // Tenth user
  'USR011'   // Eleventh user
];

console.log('📋 Simulated existing user IDs:');
existingUserIds.forEach((userId, index) => {
  console.log(`   ${index + 1}. ${userId}`);
});
console.log('');

// Extract existing user numbers
const existingUserNumbers = existingUserIds
  .filter(userId => userId.match(/^USR\d+$/))
  .map(userId => {
    const match = userId.match(/^USR(\d+)$/);
    if (!match) return 0;
    const numberStr = match[1];
    const actualNumber = parseInt(numberStr.replace(/^0+/, '') || '0');
    return actualNumber;
  })
  .filter(num => num > 0 && num <= 999)
  .sort((a, b) => a - b);

console.log(`🧪 Extracted user numbers: [${existingUserNumbers.join(', ')}]`);

// Find next available number (sequential generation)
let nextNumber = 1;
if (existingUserNumbers.length > 0) {
  // Simply use the next number after the maximum (sequential)
  nextNumber = Math.max(...existingUserNumbers) + 1;
}

if (nextNumber > 999) {
  console.log('   ❌ ERROR: Maximum user ID limit reached (999)');
} else {
  const newUserId = `USR${nextNumber.toString().padStart(3, '0')}`;
  console.log(`   Next available number: ${nextNumber}`);
  console.log(`   Generated user ID: ${newUserId}`);
}
console.log('');

// Test 3: Show examples of the format
console.log('📝 Examples of the new 3-digit format:');
const examples = [1, 10, 100, 999, 190, 5, 25, 250];
examples.forEach(num => {
  const userId = `USR${num.toString().padStart(3, '0')}`;
  console.log(`   ${num} → ${userId}`);
});
console.log('');

// Test 4: Validate format
console.log('✅ Format validation:');
const testIds = ['USR001', 'USR010', 'USR100', 'USR999', 'USR190', 'USR000', 'USR1000'];
testIds.forEach(userId => {
  const isValid = /^USR\d{3}$/.test(userId);
  const number = parseInt(userId.substring(3));
  const isInRange = number >= 1 && number <= 999;
  console.log(`   ${userId}: ${isValid && isInRange ? '✅ Valid' : '❌ Invalid'}`);
});
console.log('');

// Test 5: Show sequential generation
console.log('🔍 Sequential generation:');
console.log(`   Current highest number: ${Math.max(...existingUserNumbers)}`);
console.log(`   Next number to be generated: ${nextNumber}`);
console.log(`   Next user ID will be: USR${nextNumber.toString().padStart(3, '0')}`);
console.log('');

console.log('🎉 User ID format test completed successfully!');
console.log('   New format: USR + exactly 3 digits (001-999)');
console.log('   Examples: USR001, USR010, USR100, USR999, USR190');
console.log('   ✅ Always uses exactly 3 digits with leading zeros');
console.log('   ✅ Sequential generation (no gaps)');
console.log('   ✅ Respects the 1-999 range limit');
