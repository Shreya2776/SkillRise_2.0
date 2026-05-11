// SkillRise India - Comprehensive Testing Script
// This script tests all major functionalities

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:8000/api';
let authToken = null;
let testUserId = null;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testHealthCheck() {
  log.section();
  log.title('🏥 Testing Health Check');
  
  const result = await apiCall('GET', '/health');
  if (result.success && result.data.success) {
    log.success('Health check passed');
    log.info(`Status: ${result.data.status}`);
    log.info(`Services: ${result.data.services.join(', ')}`);
    return true;
  } else {
    log.error('Health check failed');
    return false;
  }
}

async function testAuthentication() {
  log.section();
  log.title('🔐 Testing Authentication');
  
  // Generate unique email
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@skillrise.com`;
  const testPassword = 'Test@123456';
  
  // Test Registration
  log.info('Testing user registration...');
  const registerResult = await apiCall('POST', '/auth/register', {
    email: testEmail,
    password: testPassword,
    name: 'Test User',
    role: 'user',
    skipOtp: true
  });
  
  if (registerResult.success) {
    log.success('User registration successful');
    testUserId = registerResult.data.user?._id;
  } else {
    log.error(`Registration failed: ${registerResult.error}`);
    return false;
  }
  
  // Test Login
  log.info('Testing user login...');
  const loginResult = await apiCall('POST', '/auth/login', {
    email: testEmail,
    password: testPassword
  });
  
  if (loginResult.success && loginResult.data.token) {
    log.success('User login successful');
    authToken = loginResult.data.token;
    log.info(`Token received: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    log.error(`Login failed: ${loginResult.error}`);
    return false;
  }
}

async function testProfile() {
  log.section();
  log.title('👤 Testing Profile Management');
  
  // Create Profile
  log.info('Creating user profile...');
  const profileData = {
    name: 'Test User',
    phone: '9876543210',
    location: 'Mumbai, Maharashtra',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: [{
      degree: 'B.Tech',
      institution: 'Test University',
      year: '2020'
    }],
    workExperience: [{
      title: 'Software Developer',
      company: 'Test Company',
      duration: '2 years'
    }],
    targetRole: 'Full Stack Developer'
  };
  
  const createResult = await apiCall('POST', '/profile/save', profileData);
  if (createResult.success) {
    log.success('Profile created successfully');
  } else {
    log.warning(`Profile creation: ${createResult.error}`);
  }
  
  // Get Profile
  log.info('Fetching user profile...');
  const getResult = await apiCall('GET', '/profile/me');
  if (getResult.success) {
    log.success('Profile fetched successfully');
    log.info(`Name: ${getResult.data.profile?.data?.name || 'N/A'}`);
    return true;
  } else {
    log.error(`Profile fetch failed: ${getResult.error}`);
    return false;
  }
}

async function testRoadmap() {
  log.section();
  log.title('🗺️ Testing Roadmap Generation');
  
  log.info('Generating career roadmap...');
  log.warning('This may take 10-30 seconds...');
  
  const roadmapData = {
    profile: {
      name: 'Test User',
      skills: ['JavaScript', 'HTML', 'CSS'],
      targetRole: 'Full Stack Developer'
    },
    targetRole: 'Full Stack Developer',
    duration: '6 months'
  };
  
  const result = await apiCall('POST', '/roadmap/generate', roadmapData);
  if (result.success && result.data.roadmap) {
    log.success('Roadmap generated successfully');
    log.info(`Generated ${result.data.roadmap.length} roadmap items`);
    return true;
  } else {
    log.error(`Roadmap generation failed: ${result.error}`);
    return false;
  }
}

async function testChatbot() {
  log.section();
  log.title('🤖 Testing AI Chatbot');
  
  log.info('Sending message to chatbot...');
  log.warning('This may take a few seconds...');
  
  try {
    const formData = new FormData();
    formData.append('message', 'What skills do I need to become a web developer?');
    formData.append('userId', 'test-user-123');
    
    const response = await axios.post(`${BASE_URL}/chatbot/message`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    log.success('Chatbot responded successfully');
    return true;
  } catch (error) {
    log.error(`Chatbot test failed: ${error.message}`);
    return false;
  }
}

async function testInterview() {
  log.section();
  log.title('🎙️ Testing Mock Interview');
  
  log.info('Creating interview session...');
  const interviewData = {
    role: 'Software Engineer',
    techStack: 'JavaScript, Node.js, React',
    difficulty: 'intermediate',
    type: 'technical'
  };
  
  const result = await apiCall('POST', '/interview/create', interviewData);
  if (result.success) {
    log.success('Interview session created successfully');
    log.info(`Interview ID: ${result.data.interview?._id || 'N/A'}`);
    return true;
  } else {
    log.error(`Interview creation failed: ${result.error}`);
    return false;
  }
}

async function testAdmin() {
  log.section();
  log.title('👨💼 Testing Admin Endpoints');
  
  log.info('Fetching admin stats...');
  const result = await apiCall('GET', '/admin/stats');
  
  if (result.status === 401 || result.status === 403) {
    log.warning('Admin access requires admin role (expected)');
    return true;
  } else if (result.success) {
    log.success('Admin stats fetched successfully');
    return true;
  } else {
    log.error(`Admin test failed: ${result.error}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         SkillRise India - Comprehensive Testing           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  log.info('Starting comprehensive functionality tests...');
  log.warning('Make sure backend is running on http://localhost:8000');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run tests
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Profile Management', fn: testProfile },
    { name: 'Roadmap Generation', fn: testRoadmap },
    { name: 'AI Chatbot', fn: testChatbot },
    { name: 'Mock Interview', fn: testInterview },
    { name: 'Admin Endpoints', fn: testAdmin }
  ];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.tests.push({ name: test.name, passed });
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log.error(`${test.name} threw an error: ${error.message}`);
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
  }
  
  // Print summary
  log.section();
  log.title('📊 Test Summary');
  console.log('');
  
  results.tests.forEach(test => {
    if (test.passed) {
      log.success(`${test.name}`);
    } else {
      log.error(`${test.name}`);
    }
  });
  
  console.log('');
  log.section();
  console.log(`${colors.bright}Total Tests: ${results.passed + results.failed}${colors.reset}`);
  console.log(`${colors.green}${colors.bright}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}${colors.bright}Failed: ${results.failed}${colors.reset}`);
  log.section();
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Your application is working correctly!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  Some tests failed. Please check the errors above.${colors.reset}\n`);
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});
