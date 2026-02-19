# Cloud Cost Dashboard

A comprehensive dashboard for visualizing, analyzing, and optimizing cloud infrastructure costs. This application helps organizations track their spending, set budgets, and identify cost-saving opportunities.

## 🚀 Features

- **Dashboard Overview**: Get a high-level view of your total cloud spend, active services, and cost trends.
- **Cost Explorer**: Dive deep into your spending data with interactive charts and filtering options. Analyze costs by service, region, or tag.
- **Budgets & Alerts**: Set monthly or project-based budgets and receive alerts when spending approaches or exceeds thresholds.
- **Recommendations**: Receive AI-powered recommendations to optimize your cloud usage and reduce costs (e.g., rightsizing instances, removing unused resources).
- **Settings**: Configure your dashboard preferences, manage user access, and set up notification channels.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx`, `tailwind-merge`

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cld-proj
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

4.  **Build for production:**
    ```bash
    npm run build
    ```
    This will generate optimized static files in the `dist` directory.

## 📂 Project Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── components/     # Reusable UI components
├── context/        # React Context for global state management
├── hooks/          # Custom React hooks
├── layouts/        # Page layout components (e.g., Sidebar, Navbar)
├── lib/            # Utility libraries and configurations
├── pages/          # Main application pages (Dashboard, CostExplorer, etc.)
├── utils/          # Helper functions and mock data
├── App.jsx         # Main application component with routing
└── main.jsx        # Application entry point
```

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: ESLint check.
- `npm run preview`: Previews the production build locally.

---
Built with ❤️ using React & Vite.
