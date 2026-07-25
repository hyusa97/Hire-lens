# HireLens

HireLens is an AI-assisted recruitment platform that helps recruiters publish jobs, collect candidate applications, and evaluate candidate-job fit through structured AI analysis.

The project was built as a technical project-based assessment with an emphasis on business value, production architecture, security, automated validation, CI/CD, and deployment.

## Live Application

Production: https://hire-lens-blush.vercel.app

Repository: https://github.com/hyusa97/Hire-lens

---

## Problem

Recruitment teams often spend significant time manually reviewing applications and comparing candidate profiles against job requirements.

This creates several problems:

- repetitive candidate screening
- inconsistent evaluation criteria
- difficulty identifying skill gaps quickly
- slower hiring workflows
- limited visibility across applications

HireLens provides a structured workflow where candidates can discover and apply for jobs while recruiters receive AI-assisted candidate evaluations to support their review process.

The AI is designed as a decision-support system rather than an autonomous hiring decision maker.

---

## Core Features

### Candidate Experience

Candidates can:

- browse active job openings
- search jobs by title, department, location, and skills
- view detailed job requirements
- submit applications through a validated form
- receive confirmation after successful submission

Candidate applications are stored in PostgreSQL through Supabase.

### Recruiter Authentication

Recruiters can:

- create an account
- verify their email address
- sign in securely
- access protected recruiter routes
- sign out and terminate their session

Authentication is implemented using Supabase Auth with server-side session handling.

### Recruiter Dashboard

Authenticated recruiters can:

- view recruitment statistics
- browse applications
- inspect individual candidate evaluations
- manage jobs
- create new job postings
- update candidate application status

Recruiter routes are protected server-side.

### AI Candidate Analysis

After an application is submitted, HireLens evaluates the candidate against the job requirements using Google's Gemini API.

The AI returns structured information including:

- match score
- matched skills
- missing skills
- strengths
- concerns
- evaluation summary
- recommendation

AI responses are validated using Zod before being persisted.

This prevents malformed model output from entering the application database.

---

## Application Flow

### Candidate Flow

```text
Landing Page
     |
     v
Browse Jobs
     |
     v
Job Details
     |
     v
Application Form
     |
     v
Validation
     |
     v
Candidate + Application Stored
     |
     v
Gemini Evaluation
     |
     v
Structured Output Validation
     |
     v
AI Assessment Stored
```

### Recruiter Flow

```text
Sign Up
   |
   v
Email Verification
   |
   v
Login
   |
   v
Protected Recruiter Dashboard
   |
   +----> Manage Jobs
   |
   +----> Create Job
   |
   +----> Review Applications
                 |
                 v
          AI Candidate Assessment
                 |
                 v
          Update Application Status
```

---

## Architecture

```text
                    HireLens

                       |
                 Next.js App
                       |
          +------------+-------------+
          |                          |
     Candidate UI               Recruiter UI
          |                          |
          |                    Supabase Auth
          |                          |
          +------------+-------------+
                       |
                 Server Actions
                       |
          +------------+-------------+
          |                          |
      Supabase                    Gemini API
    PostgreSQL                        |
          |                    Candidate Analysis
          |                          |
          |                    Structured JSON
          |                          |
          |                    Zod Validation
          |                          |
          +------------<-------------+
                       |
                 Recruiter Review
```

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### Backend

- Next.js Server Components
- Next.js Server Actions
- Supabase
- PostgreSQL

### Authentication

- Supabase Auth
- `@supabase/ssr`
- cookie-based server sessions
- email verification

### AI

- Google Gemini API
- `@google/genai`
- structured JSON generation
- Zod runtime validation

### Validation

- Zod

### DevOps

- GitHub
- GitHub Actions
- Vercel
- automatic production deployment

---

## AI Evaluation Design

HireLens does not directly trust model-generated text.

The AI pipeline follows:

```text
Candidate Data + Job Requirements
              |
              v
          Gemini API
              |
              v
        JSON Response
              |
              v
         JSON Parsing
              |
              v
        Zod Validation
              |
        +-----+------+
        |            |
      Valid        Invalid
        |            |
        v            v
     Persist      Reject Output
```

The expected AI contract includes:

```text
matchScore
matchedSkills
missingSkills
strengths
concerns
summary
recommendation
```

Recommendations are restricted to defined application values rather than arbitrary model-generated labels.

---

## Responsible AI

HireLens uses AI to assist recruiters, not replace human hiring decisions.

Design principles include:

- AI recommendations are advisory
- recruiters retain final decision authority
- personally identifiable information is excluded from the AI evaluation prompt where unnecessary
- AI output must pass schema validation
- malformed AI responses are rejected
- candidate applications remain stored even if AI evaluation fails
- evaluation focuses on job-related candidate information

This separation ensures an external AI failure does not cause candidate application loss.

---

## Security

Several security boundaries are used throughout the application.

### Environment Variables

Sensitive credentials are stored using environment variables and are never committed to the repository.

### Supabase Row Level Security

Database access is controlled using Supabase/PostgreSQL Row Level Security policies.

### Server-only Credentials

The Supabase service-role key and Gemini API key are used only in server-side code.

They are never exposed to the browser.

### Recruiter Route Protection

All routes under:

```text
/recruiter/*
```

require an authenticated Supabase user.

Unauthenticated requests are redirected to the login page.

### Server-side Authentication

Recruiter identity is verified server-side before protected recruiter pages are rendered.

---

## Database Model

HireLens currently uses three primary entities:

```text
jobs
 |
 | 1
 |
 | *
applications
 |
 | *
 |
 | 1
candidates
```

### Jobs

Stores information such as:

- title
- department
- location
- employment type
- experience level
- description
- required skills
- job status

### Candidates

Stores candidate profile information submitted through job applications.

### Applications

Connects candidates with jobs and stores:

- application status
- AI match score
- matched skills
- missing skills
- strengths
- concerns
- AI summary
- recommendation

---

## Validation and Testing

The project includes automated tests covering important validation boundaries.

Current validation tests include:

- valid candidate application
- invalid email
- negative experience
- empty skills
- invalid optional URL
- valid job
- invalid job
- AI match-score boundaries
- invalid AI recommendation
- valid AI evaluation schema

Run tests with:

```bash
npm test
```

---

## CI/CD

HireLens uses GitHub Actions for continuous integration.

Every push and pull request triggers:

```text
Checkout
   |
   v
Install Dependencies
   |
   v
Lint
   |
   v
Automated Tests
   |
   v
Production Build
```

The workflow verifies:

```bash
npm ci
npm run lint
npm test
npm run build
```

Only code that successfully passes these checks is considered deployment-ready.

### Continuous Deployment

The GitHub repository is connected to Vercel.

Changes pushed to the production branch automatically trigger a new Vercel deployment.

```text
Developer
    |
    v
Git Push
    |
    +-------------------+
    |                   |
    v                   v
GitHub Actions        Vercel
    |                   |
    v                   v
Lint/Test/Build    Production Build
                        |
                        v
                  Production Deployment
```

The complete Git-to-production deployment flow was verified after deployment.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/hyusa97/Hire-lens.git
cd Hire-lens
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create:

```text
.env.local
```

Use `.env.example` as the reference.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit `.env.local`.

### 4. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm test
```

Runs validation and schema tests.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm start
```

Runs the production build locally.

---

## Deployment

The application is deployed on Vercel.

Production environment variables are configured through Vercel rather than committed to source control.

Supabase Authentication is configured with the production callback:

```text
/auth/callback
```

This enables the production flow:

```text
Recruiter Signup
      |
      v
Verification Email
      |
      v
Production Auth Callback
      |
      v
Recruiter Login
      |
      v
Protected Dashboard
```

---

## Engineering Decisions

### Server-side recruiter operations

Privileged recruiter database operations use server-only infrastructure rather than exposing administrative database credentials to the client.

### AI output validation

LLM output is treated as untrusted external input.

Gemini output must satisfy the application's Zod schema before persistence.

### AI failure isolation

Candidate application persistence and AI evaluation are separated so that an AI provider failure does not discard a valid candidate application.

### Authentication boundary

Public candidate browsing and application submission remain frictionless while recruiter operations require authentication.

### Database security

Anonymous database access is restricted through RLS instead of granting broad read permissions simply to simplify application code.

---

## Current MVP Limitations

HireLens is an assessment-focused MVP.

A larger production system would additionally require:

- organization-based recruiter accounts
- recruiter role and permission management
- candidate accounts and application tracking
- password recovery
- recruiter invitations
- audit logs
- pagination for large application volumes
- background job processing for AI evaluation
- rate limiting
- richer observability and monitoring
- expanded automated integration and end-to-end testing

---

## Future Improvements

Potential next iterations include:

- semantic resume parsing
- resume upload and extraction
- candidate ranking across a job pipeline
- interview scheduling
- recruiter collaboration
- candidate application tracking
- organization workspaces
- configurable evaluation criteria
- analytics dashboards
- AI evaluation audit history

---

## Production

Live application:

https://hire-lens-blush.vercel.app

Source code:

https://github.com/hyusa97/Hire-lens