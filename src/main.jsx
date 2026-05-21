import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './main.css'
import RppgDemo from './app/demo'
import Layout from './app/user'

const router = createBrowserRouter([
  {
    path: "/demo", // <-- Add this new route object,
    element: <RppgDemo />,
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
