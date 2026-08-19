// Test getStepSize logic
function getStepSize(habit) {
  const targetValue = habit.targetValue;
  if (targetValue <= 15) return 1;

  const unitLower = (habit.unit || '').toLowerCase();
  if (unitLower.includes('step')) {
    return 1000;
  }
  if (unitLower.includes('ml')) {
    return 250;
  }
  if (unitLower.includes('min') || unitLower.includes('page') || unitLower.includes('minute')) {
    return 5;
  }

  // Default fallback: divide target by 10 and round to clean multiplier
  const divided = targetValue / 10;
  if (divided >= 1000) return 1000;
  if (divided >= 500) return 500;
  if (divided >= 100) return 100;
  if (divided >= 50) return 50;
  if (divided >= 10) return 10;
  if (divided >= 5) return 5;
  return 1;
}

const testCases = [
  { targetValue: 8, unit: 'Glasses', expected: 1 },
  { targetValue: 10000, unit: 'Steps', expected: 1000 },
  { targetValue: 5000, unit: 'steps', expected: 1000 },
  { targetValue: 50, unit: 'Mins', expected: 5 },
  { targetValue: 30, unit: 'Minutes', expected: 5 },
  { targetValue: 1000, unit: 'ml', expected: 250 },
  { targetValue: 80, unit: 'pages', expected: 5 },
  { targetValue: 200, unit: 'Pushups', expected: 10 },
  { targetValue: 1200, unit: 'calories', expected: 100 },
  { targetValue: 6000, unit: 'points', expected: 500 }
];

let failed = false;
testCases.forEach((tc, idx) => {
  const res = getStepSize(tc);
  if (res !== tc.expected) {
    console.error(`FAIL: Test Case ${idx} (${tc.targetValue} ${tc.unit}) -> expected ${tc.expected}, got ${res}`);
    failed = true;
  } else {
    console.log(`PASS: Test Case ${idx} (${tc.targetValue} ${tc.unit}) -> ${res}`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log("ALL TESTS PASSED!");
}
