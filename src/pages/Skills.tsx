
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Skills: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div>
      <h1>Skills Page</h1>
      {isLoggedIn ? (
        <p>Welcome to the skills page!</p>
      ) : (
        <p>Please log in to view your skills.</p>
      )}
    </div>
  );
};

export default Skills;
