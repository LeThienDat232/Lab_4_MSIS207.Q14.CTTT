import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import AppLayout, {
  Home,
  EffectsDemo,
  RefsDemo,
  FormsDemo,
  FetchDemo,
  AxiosDemo,
  UsersLayout,
  UserDetail,
  LoginPage,
  Dashboard,
} from "./App.jsx";

const requireAuth = () => {
  const authed = window.localStorage.getItem("lab4-authed");
  if (authed !== "true") {
    throw redirect("/login");
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "effects", element: <EffectsDemo /> },
      { path: "refs", element: <RefsDemo /> },
      { path: "forms", element: <FormsDemo /> },
      { path: "fetch", element: <FetchDemo /> },
      { path: "axios", element: <AxiosDemo /> },
      {
        path: "users",
        element: <UsersLayout />,
        children: [
          { index: true, element: <p>Select a user to view details.</p> },
          { path: ":userId", element: <UserDetail /> },
        ],
      },
      { path: "login", element: <LoginPage /> },
      { path: "dashboard", loader: requireAuth, element: <Dashboard /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
