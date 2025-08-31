import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { isUserInTeam } from "@/utils/Teams";

// TeamRoute: Only renders children if user is in team, else redirects to /teamkey
export const TeamRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const [inTeam, setInTeam] = useState<boolean | null>(null);

    useEffect(() => {
        if (user?.id) {
            isUserInTeam(user.id).then(setInTeam);
        }
    }, [user]);

    if (loading || user?.id == null || inTeam === null) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
                <div>Loading...</div>
            </div>
        );
    }
    if (!inTeam) {
        return <Navigate to="/teamkey" replace />;
    }
    return <>{children}</>;
};

// NoTeamRoute: Only renders children if user is NOT in team, else redirects to /home
export const NoTeamRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const [inTeam, setInTeam] = useState<boolean | null>(null);

    useEffect(() => {
        if (user?.id) {
            isUserInTeam(user.id).then(setInTeam);
        }
    }, [user]);

    if (loading || user?.id == null || inTeam === null) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
                <div>Loading...</div>
            </div>
        );
    }
    if (inTeam) {
        return <Navigate to="/home" replace />;
    }
    return <>{children}</>;
};