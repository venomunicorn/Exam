# GATE TestPrep Engine

A robust, full-stack web application designed to simulate real-world GATE (Graduate Aptitude Test in Engineering) exam conditions. It features a realistic exam interface, detailed performance analytics, and a history dashboard to track progress over time.

![Home Page Screenshot](./screenshots/home.png)

## 🚀 Features

-   **Realistic Exam Interface**: Fullscreen mode, timer with warnings, question palette, and "Mark for Review" functionality.
-   **Comprehensive Analytics**:
    -   Score trends over time.
    -   Topic-wise strength/weakness analysis.
    -   Time management distribution charts.
-   **Resilience**:
    -   **Auto-save**: Progress is saved to the backend every 30 seconds.
    -   **Resume Capability**: Pick up right where you left off if the browser closes or refreshes.
    -   **Anti-Cheating**: Tab switch detection and logging.
-   **Authentication**: Secure JWT-based registration and login.
-   **History Dashboard**: View past attempts and detailed reports.

---

## 🛠️ Local Development Setup

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   **Node.js** (v18 or higher)
-   **npm** (comes with Node.js)
-   **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gate-testprep-engine.git
cd gate-testprep-engine
```

### 2. Setup Backend (Server)

The backend handles authentication, data persistence, and API requests.

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory:
    ```bash
    # Create .env file
    touch .env
    ```
4.  Add the following environment variables to `server/.env`:
    ```env
    PORT=3001
    JWT_SECRET=your_super_secret_jwt_key_change_this_for_production
    USE_FILE_STORAGE=true
    # CORS_ORIGIN=http://localhost:3000 (Optional, defaults to localhost:3000)
    ```
5.  Start the backend development server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3001`.

### 3. Setup Frontend (Client)

The frontend is the React application that users interact with.

1.  Open a new terminal window/tab.
2.  Navigate to the project root (if you are in `server`, go back one level):
    ```bash
    cd ..
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The application will open at `http://localhost:3000`.

---

## ☁️ Cloud Deployment Instructions

### 1. Deploying the Backend (e.g., Render, Railway)

The backend needs to be deployed first so the frontend knows where to send requests.

**Using Render:**
1.  Create a new **Web Service** on Render connected to your GitHub repo.
2.  **Root Directory**: `server`
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    -   `JWT_SECRET`: Generate a strong random string.
    -   `USE_FILE_STORAGE`: `true` (Note: File storage on free tier Render instances is ephemeral and will reset on redeploy. For persistent production data, you should switch to a database like PostgreSQL).
    -   `PORT`: `3001` (or let Render assign one).
6.  Copy the **Service URL** (e.g., `https://my-backend.onrender.com`).

### 2. Deploying the Frontend (e.g., Vercel, Netlify)

**Using Vercel:**
1.  Import your GitHub project into Vercel.
2.  **Framework Preset**: Vite
3.  **Root Directory**: `.` (default)
4.  **Environment Variables**:
    -   You need to point the frontend to your deployed backend.
    -   Add `VITE_API_URL` = `https://my-backend.onrender.com/api` (Replace with your actual backend URL).
    -   **Important**: You might need to update `src/api/client.ts` to use this environment variable instead of hardcoded `localhost:3001` if it's not already setup to detect it.

---

## 📚 How to Add More Exams

The system allows you to easily plug in new exam papers using JSON files.

### 1. Prepare the JSON File

Create a new JSON file (e.g., `GATE_CS_2024.json`) following this schema:

```json
{
  "exam_id": "GATE_CS_2024",     // Unique ID
  "paper_id": "GATE_CS_2024",    // Same as exam_id usually
  "year": 2024,
  "label": "GATE Computer Science 2024",
  "type": "PYQ",                 // Previous Year Question
  "duration_minutes": 180,
  "total_marks": 100,
  "sections": [
    {
      "section_id": "GA",
      "title": "General Aptitude",
      "questions": [
        {
          "question_id": "Q1",
          "type": "MCQ",          // MCQ, MSQ, or NAT
          "question_text": "What is 2 + 2?",
          "options": [            // Required for MCQ/MSQ
            { "id": "A", "text": "3" },
            { "id": "B", "text": "4" }
          ],
          "correct_answer": {     // Internal mapping for evaluation
            "type": "option_id",
            "value": "B"
          },
          "marks": 1,
          "negative_marks": 0.33,
          "topic": "Arithmetic"
        }
      ]
    }
  ]
}
```

### 2. Place the File

Move your JSON file to the project root directory (e.g., `./`).

### 3. Register the Exam in the Frontend

You need to tell the application about the new file.

1.  Open `src/pages/HomePage.tsx`.
2.  Import the JSON file at the top:
    ```typescript
    import gateCS2024 from '../../GATE_CS_2024.json';
    ```
3.  Add it to the `examCatalog` array:
    ```typescript
    const examCatalog: ExamCatalogEntry[] = [
        // ... existing exams
        {
            exam_id: gateCS2024.exam_id,
            label: gateCS2024.label,
            category: 'Computer Science', // Grouping category
            tags: ['PYQ', '2024'],
            data: gateCS2024 as any // Type assertion if needed
        }
    ];
    ```
4.  Open `src/pages/ExamConfirmPage.tsx` and repeat the import and lookup logic to ensure the exam can be loaded when clicked.

---

## 💻 Tech Stack

-   **Frontend**: React, TypeScript, Vite, Zustand (State Management), Chart.js (Analytics).
-   **Backend**: Node.js, Express, TypeScript.
-   **Storage**: JSON File System (Simulated DB), easily adaptable to PostgreSQL/MongoDB.
-   **Styling**: Vanilla CSS with modern variables and responsive design.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
