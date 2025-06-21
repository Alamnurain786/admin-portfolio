# Portfolio & Blog Admin Panel

This is a comprehensive admin dashboard built with React and Vite to manage the content of a personal portfolio and blog. It provides a secure and intuitive interface for all CRUD (Create, Read, Update, Delete) operations.

## Features

- **Secure Authentication**: JWT-based login system with protected routes for authorized users.
- **Content Management**: Full control over all site content:
  - **Blog Posts**: A rich text editor for creating, editing, and publishing posts.
  - **Projects**: Showcase your work by adding and managing portfolio projects.
  - **Skills & Certifications**: Easily update your skills and credentials.
- **Media Library**: A centralized media manager to upload and reuse images across the site.
- **Dashboard Overview**: At-a-glance statistics and recent activity.
- **Responsive Design**: Built with Tailwind CSS, the dashboard is fully functional on desktop and mobile devices.
- **Dark Mode**: User-friendly dark mode for better viewing comfort.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API
- **Data Fetching**: Axios (with interceptors for auth)
- **UI Components**: Custom, reusable components for a consistent look and feel.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A running instance of the [portfolio backend API](https://github.com/Alamnurain786/my-portfolio-backend).

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd admin-portfolio
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create the environment file:**
    Create a file named `.env` in the root of the project and add the URL of your backend API.

    ```env
    # .env - for local development
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Deployment

When deploying to a hosting provider like Vercel or Netlify:

1.  **Build the project:**
    ```bash
    npm run build
    ```
2.  **Configure Environment Variables**: In your hosting provider's dashboard, set the `VITE_API_BASE_URL` environment variable to your **production backend URL** (e.g., `https://your-backend.vercel.app/api`).
