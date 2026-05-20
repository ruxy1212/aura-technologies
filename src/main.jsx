import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import RppgLiveDashboard from './assets/RppgFrontend.jsx'
import RppgDashboard from './assets/RppgDashboard.jsx'
import Layout from './app/Layout.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/rppg", // <-- Add this new route object,
    element: <RppgDashboard />,
  },
  {
    path: "/rppg-test",
    element: <RppgLiveDashboard />,
  },
  {
    path: "/frontend",
    element: <Layout />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
