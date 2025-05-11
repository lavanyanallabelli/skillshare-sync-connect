import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from 'react-router-dom';

const TeacherProfile: React.FC = () => {
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h2>Teacher Profile Page</h2>
      <p>Current User ID: {userId || 'Not logged in'}</p>
      <p>Teacher ID from URL: {id}</p>
    </div>
  );
};

export default TeacherProfile;
