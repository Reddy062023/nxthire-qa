const TEST_CANDIDATE = {
  name: 'QA Test Candidate',
  title: 'QA Engineer',
  email: 'qatest.feature@nstartest.com',
  phone: '6175550199',
  city: 'Boston',
  state: 'MA',
  years: '5',
  skills: 'Java, Python, Playwright',
};

const NO_EMAIL_CANDIDATE = {
  name: 'QA No Email Candidate',
  title: 'QA Engineer',
  years: '3',
  skills: 'Java',
};

const TEST_JOB = {
  title: 'QA Automation Engineer',
  description: 'We need a senior QA Automation Engineer with Playwright and Java experience. Must have 5+ years of experience in test automation.',
};

const TEST_VENDOR = {
  name: `QA Test Vendor ${Date.now()}`,
  email: process.env.NXTHIRE_EMAIL,
  contact: 'Test Contact',
};

const TEST_COMPANY = {
  name: `QA Test Company ${Date.now()}`,
  website: 'qatestcompany.com',
};

module.exports = {
  TEST_CANDIDATE,
  NO_EMAIL_CANDIDATE,
  TEST_JOB,
  TEST_VENDOR,
  TEST_COMPANY,
};