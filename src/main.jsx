import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RppgDashboard from '../not_in_use/RppgDashboard.jsx'
import Layout from './app/Layout.jsx'

const router = createBrowserRouter([
  {
    path: "/rppg", // <-- Add this new route object,
    element: <RppgDashboard />,
  },
  {
    path: "/",
    element: <Layout />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
