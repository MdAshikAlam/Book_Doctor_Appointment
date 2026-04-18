const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Mock User Model logic
const comparePassword = async (candidate, hash) => {
  return bcrypt.compare(candidate, hash);
};

async function test() {
  const password = 'SuperAdmin@123';
  const wrongPassword = 'WrongPassword';
  
  const hash = await bcrypt.hash(password, 12);
  console.log('Hash generated:', hash);
  
  const isMatchCorrect = await comparePassword(password, hash);
  console.log('Match with correct password:', isMatchCorrect);
  
  const isMatchWrong = await comparePassword(wrongPassword, hash);
  console.log('Match with wrong password:', isMatchWrong);
}

test();
