

# TagGenie.AI: AI-Assisted Tag Generation

**TagGenie.AI** is a simple full-stack application designed to generate relevant tags using an AI service. The repository contains Node.js/Express backend API and a modern, high-performance Vite + React Tailwind frontend.

## 🚀 Key Features

  * **Intelligent Tag Generation:** Utilizes AI middleware (e.g., OpenAI) for context-aware tag suggestions.
  * **Decoupled Architecture:** Separate backend and frontend for scalable development.
  * **Modern Stack:** Node.js/Express API with a **Vite + React** frontend styled with **Tailwind CSS v4**.

## 💻 Technical Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend (API)** | **Node.js, Express** | Provides RESTful endpoints for tag generation and data processing. |
| **Frontend (UI)** | **React, Vite** | Fast development and performant single-page application. |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS framework for rapid and responsive UI development. |

## 📁 Project Structure

```
.
├── backend/
│   ├── index.js                  # Express server entry point
│   ├── package.json              # Backend dependencies and scripts
│   ├── middleware/
│   │   └── taggenerator.js       # Core AI tag generation logic
│   ├── router/
│   │   └── tagRoute.js           # API route definitions
│   └── .env                      # Environment variables (Sensitive secrets not committed)
└── frontend/
    ├── index.html                # App entry HTML
    ├── package.json              # Frontend dependencies and scripts
    ├── vite.config.js            # Vite configuration
    ├── src/
    │   ├── main.jsx              # React app mounting point
    │   ├── App.jsx               # Main application component
    │   ├── pages/
    │   │   └── Home.jsx          # Home page component
    └── ...
```

----

## ⚙️ Quick Start (Local Development)

### Prerequisites

Ensure you have the following installed:

  * **Node.js** (v14+ recommended)
  * **npm** (Node Package Manager)

### Step 1: Install Dependencies

You must install dependencies for both the backend and frontend directories.

1.  **Backend:**

    ```powershell
    cd backend
    npm install
    ```

2.  **Frontend:**

    ```powershell
    cd frontend
    npm install
    ```

### Step 2: Configure Environment Variables

The backend requires configuration for external services (e.g., AI API keys) and the server port.

1.  Navigate to the `backend/` directory.
2.  Create a file named `.env` and populate it with required variables, such as:
    ```
    # Example .env content
    PORT=3001
    OPENAI_API_KEY="YOUR_SECRET_KEY_HERE"
    ```
    > **Note:** Never commit the `.env` file containing secrets. Consider adding a `.env.example` file listing the required keys.

### Step 3: Run the Application

The backend and frontend must be run simultaneously in separate terminal windows.

1.  **Start Backend (API Server):**

    ```powershell
    cd backend
    npm run dev
    ```

    **(The `dev` script is now used for local backend start.)**

2.  **Start Frontend (React App):**

    ```powershell
    cd frontend
    npm run dev
    ```

The application will typically be accessible at `http://localhost:5173` (as configured by Vite).

-----

## 🛠 Troubleshooting

  * **API Connection:** If the frontend displays connection errors, verify that the backend is running on the correct **PORT** (defaulted in the code or set in `backend/.env`). Also, ensure **CORS** is properly configured on the backend to allow requests from the frontend's development URL.
  * **AI Key:** Double-check that the `OPENAI_API_KEY` (or equivalent) in `backend/.env` is valid and has not expired.
  * **Build Script:** The standard production build script remains `npm run build` in the `frontend` directory.


## 📬 Contact

For any questions, issues, or feature requests, please open an issue in this repository.
