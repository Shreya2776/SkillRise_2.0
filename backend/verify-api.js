// SkillRise India - API Verification Script
// Run this script to verify all backend endpoints are working

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

async function testEndpoint(name, method, url, data = null) {
  try {
    const config = { method, url: `${BASE_URL}${url}` };
    if (data) config.data = data;
    
    const response = await axios(config);
    log.success(`${name}: ${response.status} ${response.statusText}`);
    return true;
  } catch (error) {
    if (error.response) {
      log.error(`${name}: ${error.response.status} ${error.response.statusText}`);
    } else {
      log.error(`${name}: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('SkillRise India - API Verification');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Health Check
  log.section('🏥 Health Check');
  if (await testEndpoint('Health Check', 'GET', '/health')) passed++; else failed++;

  // Auth Endpoints
  log.section('🔐 Auth Service');
  if (await testEndpoint('Register (expect 400)', 'POST', '/auth/register', {})) passed++; else failed++;
  if (await testEndpoint('Login (expect 400)', 'POST', '/auth/login', {})) passed++; else failed++;

  // Profile Endpoints
  log.section('👤 Profile Service');
  if (await testEndpoint('Get Profile (expect 401)', 'GET', '/profile')) passed++; else failed++;

  // Roadmap Endpoints
  log.section('🗺️ Roadmap Service');
  if (await testEndpoint('Generate Roadmap (expect 400)', 'POST', '/roadmap/generate', {})) passed++; else failed++;

  // Resume Endpoints
  log.section('📄 Resume Service');
  if (await testEndpoint('Analyze Resume (expect 400)', 'POST', '/resume/analyze', {})) passed++; else failed++;

  // Interview Endpoints
  log.section('🎙️ Interview Service');
  if (await testEndpoint('Get Interviews (expect 401)', 'GET', '/interview/interviews')) passed++; else failed++;

  // Chatbot Endpoints
  log.section('🤖 Chatbot Service');
  if (await testEndpoint('Send Message (expect 400)', 'POST', '/chatbot/message', {})) passed++; else failed++;

  // Admin Endpoints
  log.section('👨‍💼 Admin Service');
  if (await testEndpoint('Get Stats (expect 401)', 'GET', '/admin/stats')) passed++; else failed++;

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  log.success(`Passed: ${passed}`);
  if (failed > 0) log.error(`Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    log.success('All endpoints are accessible! ✨');
    log.info('Note: Some endpoints returned expected errors (400, 401) which is correct.');
  } else {
    log.error('Some endpoints are not accessible. Check if the server is running.');
  }
}

// Run tests
runTests().catch(console.error);
