"use client";
import { SessionProvider } from "next-auth/react";
import { UserDataProvider } from "./context/UserContext.jsx";
import CaptainContext from "./context/CaptainContext.jsx";
import AuthSync from "./AuthSync.jsx";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <div className="app-wrapper">
        <CaptainContext>
          <UserDataProvider>
            <AuthSync>
              <div className="app-container">{children}</div>
            </AuthSync>
          </UserDataProvider>
        </CaptainContext>
      </div>
    </SessionProvider>
  );
}
