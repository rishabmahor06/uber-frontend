"use client";
import { SessionProvider } from "next-auth/react";
import { UserDataProvider } from "./context/UserContext.jsx";
import CaptainContext from "./context/CaptainContext.jsx";
import SocketProvider from "./context/SocketContext.jsx";
import AuthSync from "./AuthSync.jsx";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <div className="app-wrapper">
        <CaptainContext>
          <UserDataProvider>
            <AuthSync>
              <SocketProvider>
                <div className="app-container">{children}</div>
              </SocketProvider>
            </AuthSync>
          </UserDataProvider>
        </CaptainContext>
      </div>
    </SessionProvider>
  );
}
