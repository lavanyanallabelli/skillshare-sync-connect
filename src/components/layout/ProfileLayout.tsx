
import React from "react";
import ProfileNavbar from "./ProfileNavbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

interface ProfileLayoutProps {
  children?: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <ProfileNavbar />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};

export default ProfileLayout;
