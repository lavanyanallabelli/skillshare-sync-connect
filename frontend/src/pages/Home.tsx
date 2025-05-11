
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/App';

const Home = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">SkillSync</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome to SkillSync</h2>
              <p className="mb-6 text-gray-600">
                Connect with skilled teachers and students to share knowledge and learn new skills.
              </p>
              {isLoggedIn ? (
                <div className="space-x-4">
                  <Button asChild>
                    <Link to="/profile">View Profile</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/explore">Explore Skills</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Button asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/login">Log In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
