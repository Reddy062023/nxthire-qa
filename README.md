# NxtHire.ai — QA Automation Test Suite

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

**Company:** North Star Group Inc. (SDVOSB)  
**Application:** NxtHire.ai — AI-powered recruiting platform built on the Anthropic Claude API  
**Tester:** Japendra | **Developer:** Sundar | **Management:** Amit  
**Test Period:** June 2026

---

## Why This Test Suite Was Written

NxtHire.ai is a new AI recruiting platform being built for North Star Group. As the application was being developed, there was no automated test coverage in place. This test suite was created to:

- **Verify core functionality works correctly** before the platform is used by recruiters
- **Catch bugs early** during active development so Sundar can fix them quickly
- **Test the AI recruiter behavior** — both in normal AI mode and in keyword fallback mode when API credits are exhausted
- **Provide management with clear evidence** that the platform has been tested and is ready for use
- **Create a repeatable process** so the same tests can be run again after any code change to confirm nothing broke

---

## What Was Tested and Why

### AI Recruiter Module (`ai-recruiter.spec.js`)

The AI Recruiter is the core feature of NxtHire.ai. Recruiters use it to search for candidates using natural language. These tests verify that the chat interface works, the AI responds correctly, and the system handles edge cases safely.

| Module | Why It Was Tested |
|---|---|
| **TC-01 Authentication** | Recruiters must log in securely. Invalid credentials must be rejected. Unauthenticated access must redirect to login. |
| **TC-02 Dashboard UI** | All navigation items, the chat input, the online badge, and the billing banner must be visible and working before a recruiter can use the platform. |
| **TC-05 Clear Chat** | Recruiters need to start fresh conversations. Clearing chat must work and new queries must still work after clearing. |
| **TC-06 Prompts History** | The history panel lets recruiters replay past searches. This was tested to confirm queries are saved with timestamps and can be replayed. |
| **TC-07 Navigation** | Every sidebar link must load the correct page. Broken navigation would prevent recruiters from reaching key pages. |
| **TC-08 Billing Banner** | When Anthropic API credits run out the system falls back to keyword matching. The billing banner warns users about this. The dismiss button and settings link must work. |
| **TC-09 Accessibility** | Keyboard navigation and responsive layout were tested to confirm the platform works on different screen sizes including mobile. |

---

### Candidates Page (`candidates.spec.js`)

The Candidates page is where recruiters browse and search 80,533 candidate profiles. These tests verify that search, filters, pagination, and candidate actions all work correctly.

| Module | Why It Was Tested |
|---|---|
| **TC-11-A Page Load** | The page must load with data, show all filter dropdowns, and display the correct action buttons before a recruiter can work. |
| **TC-11-B Search** | Search is the most used feature on the Candidates page. It was tested with names, skills, company names, partial words, case variations, and nonsense input to confirm it works correctly and handles edge cases. |
| **TC-11-C Filters** | Recruiters filter candidates by location, source, status, and experience. These were tested individually and in combination to confirm filters narrow results correctly. |
| **TC-11-D View Profile** | Recruiters click View to see full candidate details. The profile must open, show content, and allow the recruiter to go back to the list. |
| **TC-11-E Export** | Recruiters export candidate data for reporting. The export button must trigger a file download. |
| **TC-11-F Bulk Import** | Recruiters upload resumes in bulk. The import modal must open and accept supported file formats. |
| **TC-11-G Ask Agent** | The Ask agent button lets recruiters move from the Candidates page to the AI Recruiter. It must navigate correctly. |
| **TC-11-H Pagination** | With 80,533 candidates the page uses pagination. Per page options and page navigation must work so recruiters can browse all candidates. |
| **TC-11-I Sort** | The sort control must be present so recruiters can order candidates by best match. |

---

## Test Files

| File | Module | Tests |
|---|---|---|
| `ai-recruiter.spec.js` | AI Recruiter | 29 automated tests across 7 modules |
| `candidates.spec.js` | Candidates Page | 29 automated tests across 9 modules |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Reddy062023/nxthire-qa.git
cd nxthire-qa
npm install
npx playwright install
```

### Set Up Credentials

Create a `.env` file in the root folder:

```
NXTHIRE_EMAIL=your@email.com
NXTHIRE_PASSWORD=yourpassword
```

> ⚠️ Never commit the `.env` file. It is already in `.gitignore`.

---

## Running Tests

```bash
# Run all tests
npx playwright test ai-recruiter.spec.js candidates.spec.js --headed

# Run AI Recruiter only
npx playwright test ai-recruiter.spec.js --headed

# Run Candidates page only
npx playwright test candidates.spec.js --headed

# Run a specific module
npx playwright test --grep "TC-01" --headed

# Run Chrome only for speed
npx playwright test --project=chromium --headed
```

---

## Allure Report

```bash
npx allure generate allure-results --clean -o allure-report
npx allure serve allure-results
```

🔗 **[View Live Report](https://reddy062023.github.io/nxthire-qa/)**

---

## Phase Plan

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | AI Recruiter + Candidates Page | ✅ Complete |
| Phase 2 | Open Jobs + Data Sources | 🔜 In Progress |
| Phase 3 | AI mode testing (requires API credits) | ⏳ Pending |

---

## Author

**Japendra** — QA Tester, North Star Group Inc. — June 2026
