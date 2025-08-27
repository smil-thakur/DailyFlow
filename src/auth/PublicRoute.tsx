import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

// If logged in → redirect to /home
// If not → render the page
export const PublicRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()

    return user ? <Navigate to="/home" replace /> : children;
};