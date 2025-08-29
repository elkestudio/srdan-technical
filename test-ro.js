function validateAndCorrectRO(roValue) {
  if (!roValue || roValue.length < 2) {
    return roValue;
  }
  
  const modelNumber = roValue.substring(0, 2);
  const referenceNumber = roValue.substring(2);
  
  if (modelNumber !== '97' && modelNumber !== '11') {
    return '00' + referenceNumber;
  }
  
  return roValue;
}

console.log('Testing RO validation:');
console.log('Original example (97): 97742850113660828 ->', validateAndCorrectRO('97742850113660828'));
console.log('Valid model 11: 11123456789012345 ->', validateAndCorrectRO('11123456789012345'));
console.log('Invalid model 12: 12345678901234567 ->', validateAndCorrectRO('12345678901234567'));
console.log('Invalid model 99: 99888777666555444 ->', validateAndCorrectRO('99888777666555444'));
console.log('Invalid model 23: 23456789012345678 ->', validateAndCorrectRO('23456789012345678'));
