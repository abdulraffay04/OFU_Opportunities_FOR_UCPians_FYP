# OFU — Opportunities for UCPians

**OFU** is an AI-integrated web and mobile platform built for students of the **University of Central Punjab (UCP)** to discover jobs, internships, scholarships, freelance projects, and events — while also getting AI-powered resume feedback, chatting with a university-trained AI assistant, and connecting with alumni for mentorship and networking.

The platform is built as **5 independent services** that communicate over HTTP, with a single Node.js backend acting as the central hub for all data and business logic, and two standalone Python/Flask microservices providing the AI capabilities.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Repository / Folder Structure](#repository--folder-structure)
- [How a Request Flows (Example)](#how-a-request-flows-example)
- [Core Features](#core-features)
- [AI Services in Detail](#ai-services-in-detail)
- [Firestore Data Model](#firestore-data-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Team](#Development-Team-(Authors))

---

## Overview

OFU stands for **"Opportunities for UCPians."** It centralizes everything a university student needs for their career journey into one platform:

- Browse and apply for jobs, internships, scholarships, freelance gigs, and events
- Get instant, AI-driven feedback on a resume (ATS score, skill extraction, job-description matching, course recommendations for missing skills)
- Chat with an AI assistant trained specifically on UCP's own handbooks, policies, and scholarship rules
- Connect with alumni for mentorship and networking
- Give employers/alumni a way to post opportunities and review applicants
- AI-Assisted Candidate Shortlisting where alumni/employer auto-shortlist the top applicants
- Give admins full control over moderation, user management, and platform analytics

The platform currently supports **three user roles**: **Student**, **Alumni/Employer**, and **Admin**, each with a dedicated UI and permission set.

---

## System Architecture

OFU is composed of **5 independently running services**, each on its own port, communicating only over HTTP — never by directly importing each other's code or touching each other's databases.

```
┌──────────────────┐        ┌───────────────────┐
│   ofu-web        │        │   ofu-mobile      │
│  React.js (3000) │        │ React Native/Expo │
└─────────┬────────┘        └─────────┬─────────┘
          │                           │
          └────────────┬──────────────┘
                       │  HTTP + JWT
                       ▼
             ┌──────────────────────┐
             │    ofu-backend       │
             │  Node.js/Express     │
             │      Port 5000       │
             │  (the ONLY service   │
             │  that talks to the   │
             │  database directly)  │
             └─────────┬────────────┘
                       │
        ┌──────────────┼───────────────┐
        ▼                              ▼
┌────────────────────────┐        ┌─────────────────────┐
│ Resume Analyzer        │        │   UCP AI Chatbot    │
│ Python / Flask         │        │  Python / Flask     │
│    Port 8000           │        │     Port 8001       │
│ DistilBERT +           │        │ ChromaDB + Groq     │
│ Sentence Transformers  │        │ Llama 3.3 70B       │
└────────────────────────┘        └─────────────────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Firebase Firestore │
             │  (single database) │
             └────────────────────┘
```

**Key architectural rule:** the web and mobile apps never talk to the Python AI services or the database directly. Every single request — no matter the feature — goes through `ofu-backend`, which acts as the "traffic cop" / receptionist for the whole system. This keeps the AI services stateless and completely decoupled from platform logic: they don't know OFU exists, they just receive input and return JSON.

**One-line summary:** *Web and mobile both hit one Node.js API; that API calls two separate Python AI services when needed, and stores everything else in one Firestore database.*

---

## User Roles

| Role | How they sign up | What they can do |
|---|---|---|
| **Student** | Must register with a valid UCP email (regex-enforced, e.g. `L1F22BSCS0650@ucp.edu.pk`) | Browse/apply to opportunities, use the Resume Analyzer, chat with the AI assistant, save opportunities, connect with alumni |
| **Alumni / Employer** | Any email allowed | Post opportunities (go into a "pending" review queue), review and shortlist applicants who apply |
| **Admin** | Created manually — no public signup | Approve/reject opportunities, post official opportunities directly (auto-approved), manage all accounts (block/unblock), view platform-wide analytics |

Roles are attached to a user's login session using **Firebase Custom Claims**, embedded directly inside their JWT token, so the backend can trust the role on every request without querying the database each time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js, Express.js |
| Web frontend | React.js |
| Mobile frontend | React Native (Expo) |
| Database | Firebase Firestore (NoSQL) |
| Authentication | Firebase Authentication + Custom Claims (JWT) |
| File storage | Firebase Storage |
| Resume Analyzer service | Python, Flask, PyTorch, Hugging Face Transformers (DistilBERT), Sentence-Transformers, spaCy, scikit-learn, PyMuPDF, python-docx |
| UCP Chatbot service | Python, Flask, ChromaDB (vector database), Sentence-Transformers, Groq API (Llama 3.3 70B Versatile) |

---

## Repository / Folder Structure

The repository is a monorepo containing all 5 services:

```
ofu-platform/
├── ofu-backend/            # Node.js + Express API (port 5000)
├── ofu-web/                 # React.js web app (port 3000)
├── ofu-mobile/               # React Native / Expo app (port 8081)
└── ofu-ai-service/
    ├── backend/                # Resume Analyzer — Python/Flask (port 8000)
    └── ucp-ai-chatbot/
        └── backend/               # UCP Chatbot — Python/Flask (port 8001)
```

### `ofu-backend/` — Node.js API

Follows a consistent, repeatable layered pattern for every feature module:
`routes.js` (defines URL paths) → `validator.js` (checks input) → `controller.js` (handles request/response) → `service.js` (actual Firestore logic).

```
ofu-backend/src/
├── modules/
│   ├── admin/            # getPendingOpportunities, approveOpportunity,
│   │                        rejectOpportunity, getAnalytics,
│   │                        deactivateUser, activateUser
│   ├── ai/                # Bridge to the Python AI services
│   │                        (analyzeResume, chat)
│   ├── alumni/            # Alumni/employer profile management
│   ├── applications/      # Handles submitted job/internship applications
│   ├── auth/               # Signup (registerProfile), getMe
│   ├── notifications/     # In-app alerts (application status, approvals)
│   ├── opportunities/     # createOpportunity, getAllApproved,
│   │                        getMyOpportunities, getRecommended
│   ├── saved/              # Bookmarking opportunities
│   ├── uploads/            # File uploads to Firebase Storage
│   └── users/               # updateProfile, getAllUsers (admin only)
├── middleware/
│   ├── authenticate.js    # Verifies the Firebase JWT — is the user logged in?
│   ├── authorize.js        # Checks the user's role against the route
│   ├── errorHandler.js     # Catches crashes, returns clean JSON errors
│   └── rateLimiter.js       # Throttles requests per IP
└── config/
    ├── constants.js         # Firestore collection names, shared constants
    ├── env.js                 # Loads secrets/settings from .env
    ├── fieldKeywords.js       # Keyword dictionary for opportunity tagging
    └── firebase.js             # Initializes the Firebase Admin SDK
```

### `ofu-web/` — React.js Web App

Organized **by user role** rather than by feature — each role gets its own folder of pages.

```
ofu-web/src/
├── pages/
│   ├── student/
│   │   ├── BrowseOpportunities.js
│   │   ├── Chatbot.js
│   │   ├── ConnectAlumni.js
│   │   ├── ResumeAnalyzer.js
│   │   ├── SavedOpportunities.js
│   │   └── StudentProfile.js
│   ├── alumni/
│   │   ├── AlumniProfile.js
│   │   ├── ApplicationsReceived.js
│   │   ├── MyPostedOpportunities.js
│   │   └── PostOpportunity.js
│   ├── admin/
│   │   ├── AdminApplications.js
│   │   ├── AdminPostOpportunity.js
│   │   ├── Analytics.js
│   │   ├── PendingOpportunities.js
│   │   └── UserManagement.js
│   ├── LandingPage.js
│   ├── LoginPage.js
│   └── SignupPage.js
├── components/
│   ├── AdminLayout.js / AlumniLayout.js / StudentLayout.js  # role-based shells
│   ├── NotificationBell.js
│   └── ProtectedRoute.js     # gate that checks login + role before rendering
└── context/
    └── AuthContext.js          # global auth state (who's logged in, their role)
```

### `ofu-mobile/` — React Native (Expo) App

A near-exact mirror of `ofu-web`, built with mobile components instead of web components, following the same role-based organization.

```
ofu-mobile/src/
├── screens/
│   ├── student/
│   │   ├── AlumniScreen.js
│   │   ├── ApplyScreen.js
│   │   ├── BrowseScreen.js
│   │   ├── ChatbotScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── ResumeScreen.js
│   │   └── SavedScreen.js
│   ├── employer/
│   │   ├── ApplicationsScreen.js
│   │   ├── EmployerProfileScreen.js
│   │   ├── MyPostsScreen.js
│   │   └── PostOpportunityScreen.js
│   ├── admin/
│   │   ├── AdminApplicationsScreen.js
│   │   ├── AnalyticsScreen.js
│   │   ├── PendingScreen.js
│   │   └── UserManagementScreen.js
│   ├── LoginScreen.js
│   └── SignupScreen.js
├── components/
│   ├── ApplicationModal.js
│   ├── Header.js
│   ├── LoadingSpinner.js
│   └── StudentMenu.js / StudentMenuBar.js
├── context/
│   └── AuthContext.js
└── services/
    └── api.js                  # Axios instance, attaches JWT to every request
```

### `ofu-ai-service/backend/` — Resume Analyzer (Flask, port 8000)

```
backend/
├── app.py                       # Flask server, defines the /analyze route
├── config.py                    # Model paths, allowed upload extensions
├── requirements.txt
├── test_api.py / test_resume.txt   # Local API testing helpers
├── data/
│   ├── courses.csv               # University courses, for skill-gap recommendations
│   ├── resume_data.csv           # Raw resume dataset used for training
│   └── skills_en.csv             # ESCO skills dictionary
├── models/
│   ├── ats_train_data.json
│   ├── matcher_train_data.json
│   ├── ats_distilbert/            # Fine-tuned DistilBERT (ATS scoring)
│   └── matcher_sentence_transformer/   # Fine-tuned Sentence-Transformer (job matching)
├── training/
│   ├── prepare_data.py            # Builds JSON training sets from resume_data.csv
│   ├── train_ats_model.py          # Fine-tunes DistilBERT for ATS scoring
│   └── train_matcher.py             # Fine-tunes Sentence-Transformer for matching
└── utils/
    ├── ats_scorer.py                # Loads DistilBERT, scores resume + suggestions
    ├── course_recommender.py        # Cosine-similarity based course recommendations
    ├── extractor.py                  # PDF/DOCX/TXT text + skill extraction (spaCy)
    ├── matcher.py                    # Semantic resume-to-JD match scoring
    └── skill_advisor.py               # ESCO lookups for missing-skill advice
```

### `ofu-ai-service/ucp-ai-chatbot/backend/` — UCP Chatbot (Flask, port 8001)

```
backend/
├── app.py                    # Flask server, defines the /chat route
├── config.py                 # Loads GROQ_API_KEY, vector DB paths
├── chatbot.py                # Core controller — orchestrates RAG + LLM call
├── rag.py                     # UCPKnowledgeBase — ChromaDB + Sentence-Transformers search
├── build_vector_db.py         # One-time script: embeds UCP PDFs into ChromaDB
├── pdf_loader.py               # Reads/splits text from UCP PDF handbooks
├── query_expander.py           # Expands short queries for better retrieval
├── intent_router.py             # Detects intent (cgpa / scholarship / degree / general)
├── source_manager.py            # Extracts source PDF names for citations
├── profile_manager.py           # Session context (major, CGPA) — in-memory
├── academic_advisor.py           # RAG tool for academic policy questions
├── cgpa_calculator.py             # Pure-math tool for required GPA calculations
├── degree_planner.py               # RAG tool for graduation requirements
├── scholarship_checker.py           # RAG tool for scholarship eligibility rules
├── system_prompt.txt                 # Persona/instructions for the Llama model
└── test_chatbot.py                    # Local testing script
```

---

## How a Request Flows (Example)

Walking through what happens end-to-end when a student clicks **"Analyze"** on their resume:

1. Student is on `ofu-web` (or `ofu-mobile`), uploads a PDF, clicks **Analyze**.
2. `ofu-web` sends an HTTP `POST` request to `ofu-backend` at `http://localhost:5000/api/v1/ai/analyze-resume`, with the file attached and the student's JWT in the header.
3. `ofu-backend`'s `authenticate.js` middleware verifies the token belongs to a logged-in user.
4. The `ai` module's controller receives the file and hands it to its service layer.
5. The service layer wraps the file in `FormData` and sends a **new, separate** HTTP `POST` request to `http://localhost:8000/analyze` — the Python Resume Analyzer.
6. The Flask service extracts text, runs the fine-tuned DistilBERT model for an ATS score, uses Sentence-Transformers + cosine similarity to compute a job-description match, looks up missing skills in the ESCO dataset, and recommends university courses — then returns everything as one JSON payload.
7. `ofu-backend` saves a copy of the result to the `resumeReports` Firestore collection (so the student can revisit past analyses), then forwards the same result to the frontend.
8. `ofu-web` renders the ATS score, extracted skills, match percentage, and improvement suggestions on screen.

At no point does the web/mobile app talk to the Python service directly — `ofu-backend` is the middleman for every step. This same pattern (**frontend → backend → optionally a Python service → backend → frontend**) repeats for every AI-powered feature, including the chatbot.

---

## Core Features

- **Opportunity Lifecycle** — Admin-posted opportunities are auto-approved; alumni-posted ones enter a "pending" review queue. Students only ever see `status == approved` listings. Applying is validated against the deadline, duplicate applications, and approval status before it's accepted.
- **AI Resume Analyzer** — Upload a PDF/DOCX/TXT resume, extract skills via spaCy + the ESCO dictionary, score ATS-friendliness with a fine-tuned DistilBERT model, semantically match against a job description with Sentence-Transformers + cosine similarity, and get course recommendations for any missing skills.
- **UCP AI Chatbot** — A Retrieval-Augmented Generation (RAG) assistant. Student questions are embedded and matched against a ChromaDB vector store built from UCP's own PDF handbooks, and the retrieved context is fed into Llama 3.3 70B (via Groq) so answers are grounded in real UCP policy instead of the model's general internet knowledge. Specialized tools handle CGPA calculations, degree requirements, and scholarship eligibility.
- **AI-Assisted Candidate Shortlisting** — Lets an alumni/employer auto-shortlist the top N applicants for their opportunity by skill match, CGPA, or a weighted blend of both. See [Candidate Shortlisting](#candidate-shortlisting-for-alumniemployer) below for the scoring details.
- **Field-Based Recommendations** — Matches a student's typed department against a keyword dictionary (weighted 60%) combined with a skill match (weighted 40%) to sort a personalized "Recommended" feed.
- **In-App Notifications** — Triggered automatically on key events (e.g., an opportunity being approved generates a notification for every relevant student).
- **Alumni Networking** — Students can browse public alumni profiles to find mentors; alumni/employers manage a dedicated company profile.
- **Admin Console** — Approve/reject opportunities, manage and block/unblock user accounts, and view platform-wide analytics.
- **Role-Aware Auth** — UCP-email enforcement for students at signup, Firebase Custom Claims for role-based access control, and password changes that require re-authentication with the current password.
- **Voice-to-Text Search** — Uses the browser's native Web Speech API on the web app (no custom AI model involved).

---

## AI Services in Detail

The platform has three AI-driven capabilities: two run as standalone Python services, and one is a scoring algorithm built directly into the Node backend.

### 1. Resume Analyzer (`ofu-ai-service/backend`, port 8000)

A standalone Flask service with no knowledge of the OFU platform — it simply accepts a file and returns structured JSON.

- **Text & skill extraction** — `extractor.py` reads PDFs with PyMuPDF (`fitz`) and Word docs with `python-docx`, then uses spaCy against the ESCO-based `skills_en.csv` dictionary to pull out professional skills.
- **ATS scoring** — `ats_scorer.py` loads a DistilBERT sequence-classification model fine-tuned on resume text (`training/train_ats_model.py`) to predict how ATS-friendly a resume is, plus rule-based improvement suggestions.
- **Job-description matching** — `matcher.py` uses a fine-tuned Sentence-Transformer model (base: `all-MiniLM-L6-v2`) to embed both resume skills and JD skills, then computes cosine similarity so that, for example, "Node.js" is correctly recognized as related to "JavaScript" — semantic, not just exact-string, matching.
- **Course recommendations** — `course_recommender.py` compares missing skills against `courses.csv` using cosine similarity to suggest relevant classes.
- **Skill advice** — `skill_advisor.py` looks up any missing skills in the ESCO dataset to explain what they are and how to learn them.

### 2. UCP AI Chatbot (`ofu-ai-service/ucp-ai-chatbot/backend`, port 8001)

A Retrieval-Augmented Generation (RAG) system, also fully independent of the OFU platform.

- **Vector store** — `build_vector_db.py` is a one-time offline script that reads every UCP PDF handbook/policy document, splits them into ~1000-character chunks, embeds them with `all-MiniLM-L6-v2` (the same embedding model the Resume Analyzer uses), and stores them in a persistent **ChromaDB** database.
- **Retrieval** — On each incoming message, `rag.py`'s `UCPKnowledgeBase` embeds the question and searches ChromaDB for the top-k (5) most relevant chunks.
- **Intent routing** — `intent_router.py` detects whether the query is about CGPA, scholarships, degree requirements, or general info, and `chatbot.py` routes to the matching specialized tool (`cgpa_calculator.py`, `scholarship_checker.py`, `degree_planner.py`, `academic_advisor.py`) to pull in extra targeted context before answering.
- **Generation** — The retrieved chunks are assembled into a grounding context and sent, together with the question and a fixed persona defined in `system_prompt.txt`, to **Llama 3.3 70B Versatile** via the **Groq API**. This forces the model to answer only from real UCP documents rather than hallucinating from general internet knowledge.
- **Source citation** — `source_manager.py` tracks which PDF each retrieved chunk came from, so the chatbot can cite its sources (e.g., "according to the Student Handbook").
- **Session context** — `profile_manager.py` keeps lightweight in-memory context (e.g., major, semester) to personalize answers within a session.

### 3. Candidate Shortlisting (for Alumni/Employer)

Unlike the two services above, this feature is **not** a separate Python service — it's a scoring algorithm built directly into `ofu-backend`'s `applications/service.js`, exposed to alumni/employers as an "Auto-Shortlist" action on their posted opportunities.

When an alumni/employer requests the top **N** candidates for an opportunity, `shortlistCandidates()` scores every applicant using up to two signals, chosen via a `criteria` parameter (`"skills"`, `"cgpa"`, or `"both"`):

- **Skill score** — `calculateSkillScore()` splits the student's comma-separated skills and the opportunity's required skills into lists, counts how many required skills the student has (using substring overlap so close variants still match), and returns it as a percentage out of 100.
- **CGPA score** — `calculateCgpaScore()` converts the student's CGPA from a 4.0 scale into a 0–100 percentage.
- **Final score** — if `criteria` is `"both"` (the default), the two are combined with a **60% weight on skills and 40% weight on CGPA**:

  ```javascript
  finalScore = (skillScore * 0.6) + (cgpaScore * 0.4);
  ```

All applicants are then sorted highest-to-lowest by `finalScore`, the top **N** requested are sliced off, and their application `status` is updated to `"shortlisted"` in Firestore — instantly surfacing the best-fit candidates to the alumni/employer without them having to manually review every applicant.

This is the same skill-overlap logic reused (with a field-match component swapped in) to power the student-facing "Recommended" opportunities feed, keeping the matching approach consistent across the platform.

---

## Firestore Data Model

All persistent data lives in a single Firebase Firestore database, organized into these collections:

| Collection | Purpose |
|---|---|
| `users` | All user profiles; document ID matches the Firebase Auth `uid` |
| `opportunities` | Jobs/internships/scholarships/events, tracking `status` (pending/approved/rejected) and `postedBy` |
| `applications` | Links a `studentID` to an `opportunityID`, holds the submitted `resumeUrl` |
| `saved` | Bookmarks linking a student to an opportunity |
| `alumniProfiles` | Extended fields for alumni/employers (company, job title, etc.) |
| `resumeReports` | Archived JSON output from the Resume Analyzer for each analysis |
| `chatbotLogs` | Log of every chatbot message and response |
| `adminLogs` | Audit trail of sensitive admin actions (approvals, blocks, etc.) |

Because Firestore is NoSQL and has no native `JOIN`, relational-style views (e.g., listing applicants alongside their profile info) are built by looping through documents and fetching related records manually in the service layer.

---

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.x with `venv`
- A Firebase project (Firestore + Authentication + Storage enabled)
- A Groq API key (for the chatbot's LLM calls)
- Expo CLI (for running the mobile app)

### Services & Ports

| # | Service | Port | Directory |
|---|---|---|---|
| 1 | Node.js Backend | 5000 | `ofu-backend` |
| 2 | React Web App | 3000 | `ofu-web` |
| 3 | Expo Mobile App | 8081 | `ofu-mobile` |
| 4 | Resume Analyzer (Flask) | 8000 | `ofu-ai-service/backend` |
| 5 | UCP AI Chatbot (Flask) | 8001 | `ofu-ai-service/ucp-ai-chatbot/backend` |

### Running Locally

Each service runs in its own terminal.

**Terminal 1 — Backend**
```bash
cd ofu-platform/ofu-backend
npm install
npm run dev
```

**Terminal 2 — Web**
```bash
cd ofu-platform/ofu-web
npm install
npm start
```

**Terminal 3 — Mobile**
```bash
cd ofu-platform/ofu-mobile
npm install
npx expo start --clear
```

**Terminal 4 — Resume Analyzer**
```bash
cd ofu-platform/ofu-ai-service/backend
python -m venv venv
venv\Scripts\activate        # on macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Terminal 5 — UCP Chatbot**
```bash
cd ofu-platform/ofu-ai-service/ucp-ai-chatbot/backend
python -m venv venv
venv\Scripts\activate        # on macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Once all five services are running, the web app will be available at `http://localhost:3000`, and it (along with the Expo app) will route every request through the backend at `http://localhost:5000`.

---

## Environment Variables

Each service reads its secrets from its own `.env` file (not committed to the repo).

**`ofu-backend/.env`**
- Firebase Admin SDK service account credentials
- Port and other server settings

**`ofu-ai-service/ucp-ai-chatbot/backend/.env`**
```
GROQ_API_KEY=your_groq_api_key_here
FLASK_HOST=0.0.0.0
FLASK_PORT=8001
MODEL_NAME=llama-3.3-70b-versatile
```

**`ofu-web` / `ofu-mobile`**
- Firebase client SDK config (API key, project ID, etc.)
- Base URL pointing to the `ofu-backend` API

---

## Project Demonstration Video

https://github.com/user-attachments/assets/0f6d2567-3caf-4869-b70b-68a366bbd8b9

- Youtube Video: https://youtu.be/gAfatefvdUM?si=qlYfUXIPDaijKROU

---

## Development Team (Authors)

**Developed By:**

| Team Members |
|-------------|
| Abdul Raffay |
| Awais Ahmed Khan |
| Daniyal Shahid |
| M. Farrukh Mehmood |

**Program:** BS Computer Science  
**Institution:** University of Central Punjab (UCP), Lahore


**Project Supervisor**

**Dr. Aneela Mehmood**  
Senior Lecturer, Faculty of Information Technology (FOIT)  
University of Central Punjab (UCP), Lahore
