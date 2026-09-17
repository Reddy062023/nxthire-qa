# \# NxtHire.ai — QA Automation Test Suite

# 

# Company: North Star Group Inc. (SDVOSB)

# Application: NxtHire.ai — AI-powered recruiting platform built on the Anthropic Claude API

# Tester: Japendra | Developer: Sundar | Management: Amit

# 

# \## Why This Test Suite Was Written

# 

# NxtHire.ai is a new AI recruiting platform being built for North Star Group. As the application was being developed, there was no automated test coverage in place. This test suite was created to:

# 

# \- Verify core functionality works correctly before the platform is used by recruiters

# \- Catch bugs early during active development so Sundar can fix them quickly

# \- Test the AI recruiter behavior, both in normal AI mode and in keyword fallback mode when API credits are exhausted

# \- Provide management with clear evidence that the platform has been tested and is ready for use

# \- Create a repeatable process so the same tests can be run again after any code change to confirm nothing broke

# 

# \## Two Test Suites in This Repo

# 

# This repo contains two generations of test coverage, written at different phases of the project.

# 

# \### 1. Root-level suite (Phase 1-2, June-July 2026)

# 

# Early smoke-test-style coverage of core platform mechanics, written before the platform's 15 features were fully defined.

# 

# \- ai-recruiter.spec.js - AI Recruiter chat interface (authentication, dashboard UI, clear chat, prompts history, navigation, billing banner, accessibility)

# \- candidates.spec.js - Candidates page (page load, search, filters, view profile, export, bulk import, Ask agent, pagination, sort) across 80,000+ candidate profiles

# \- openjobs.spec.js - Open Jobs page

# \- datasources.spec.js - Data Sources page

# \- team.spec.js / team-capture.spec.js - Team management page

# \- feature-audit.spec.js - General feature audit checks

# 

# Run these directly from the repo root, e.g.:

# npx playwright test ai-recruiter.spec.js candidates.spec.js --headed

# 

# \### 2. tests/ folder suite (current, August 2026 onward)

# 

# Full functional coverage of all 15 core features of the platform, written feature-by-feature as each one was defined and built out. This is the actively maintained suite going forward.

# 

# \- tests/feature1.spec.js through tests/feature15.spec.js - one standalone spec file per feature, each independently runnable

# \- tests/auth.setup.js - shared login used by every feature spec

# \- tests/perf.spec.js - timing checks for login, Candidates, and Open Jobs page loads

# \- tests/archive/ - retired monolithic all-in-one suite from early in this phase, kept for history only; not run

# 

# Run these from inside tests/, e.g.:

# npx playwright test tests/feature7.spec.js --reporter=list

# 

# \## Feature Coverage (tests/ suite)

# 

# 1\. Create Candidate Manually - Complete

# 2\. Parse Resume on Create - Complete (2 known extraction bugs documented in-suite)

# 3\. Edit Candidate - Complete

# 4\. Word Resume Download - Complete

# 5\. Email Button and Templates - Complete

# 6\. Verification Checklist and Duplicate Check - Complete

# 7\. Jobs: Templates, Assignment, On-Hold - Complete

# 8\. Requirements / Sales - Complete

# 9\. Interviews and Placements - Complete

# 10\. Vendors and Email Sequences - Complete

# 11\. Application Pipeline - Partial, one test case only, see note below

# 12\. Analytics and Reports - Complete

# 13\. Hotlist Email - Complete

# 14\. Sales CRM - Complete

# 15\. Job Seeker Portal - Partial, pending design finalization on the share flow

# 

# Feature 11 note: the "Pick jobs \& apply" screen intermittently shows a false "No open jobs" state under fast automated interaction. This reproduces in automated testing but not under normal manual use. Only the Analytics-verification test case (TC-F11-03) is automated for this feature until that behavior is resolved.

# 

# \## Getting Started

# 

# Prerequisites: Node.js 18+, npm

# 

# git clone https://github.com/Reddy062023/nxthire-qa.git

# cd nxthire-qa

# npm install

# npx playwright install

# 

# Create a .env file in the root folder:

# 

# NXTHIRE\_EMAIL=your@email.com

# NXTHIRE\_PASSWORD=yourpassword

# 

# Never commit the .env file. It is already in .gitignore.

# 

# \## Running Tests

# 

# Root-level legacy suite:

# npx playwright test ai-recruiter.spec.js candidates.spec.js --headed

# npx playwright test --grep "TC-01" --headed

# npx playwright test --project=chromium --headed

# 

# Current feature suite:

# npx playwright test tests/feature7.spec.js --reporter=list

# npx playwright test --reporter=list

# 

# \## Allure Report

# 

# npx allure generate allure-results --clean -o allure-report

# npx allure serve allure-results

# 

# \## Known Open Issues

# 

# See the latest consolidated test results document for the full list of known bugs and their current status.

# 

# \## Phase Plan

# 

# Phase 1: AI Recruiter + Candidates Page - Complete

# Phase 2: Open Jobs + Data Sources - Complete

# Phase 3: All 15 platform features (tests/ suite) - Complete, ongoing maintenance

# Phase 4: Job Seeker Portal completion - Pending design finalization

# 

# \## Author

# 

# Japendra — QA Tester, North Star Group Inc.

