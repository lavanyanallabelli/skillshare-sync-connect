
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePictureProps {
  src: string;
  alt: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ 
  src, 
  alt, 
  fallback,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  return (
    <div className="flex justify-center">
      <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-md`}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ProfilePicture;
