import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './tailwind.css'
import './main.css'
import RppgDemo from './app/demo/Index'
import UserDashboard from './app/user/Index'
import UserAuth from './app/user/Auth'
import WebsiteLayout from './app/website/layouts/WebsiteLayout'
import Landing from './app/website/Landing'
import Docs from './app/website/Docs'
import Terms from './app/website/Terms'
import Privacy from './app/website/Privacy'

const router = createBrowserRouter([
  {
    path: "/demo", // <-- Add this new route object,
    element: <RppgDemo />,
  },
  {
    path: "/auth",
    element: <UserAuth />,
  },
  {
    path: "/dashboard",
    element: <UserDashboard />,
  },
  {
    path: "/",
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "docs", element: <Docs /> },
      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
