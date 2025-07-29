import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useGeolocation } from "../hooks/usegeolocation";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { location, askLocation } = useGeolocation()
  const { user, loading } = useAuth();

  useEffect(() => {
    if(!location){
      askLocation();
    }
  }, [location])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }

  return user?.email ? <>{children}</> : <Navigate to="/signin" />;
};
