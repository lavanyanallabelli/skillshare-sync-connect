import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to SkillSync</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Connect with skilled teachers and students to share knowledge and learn new skills.
        </p>

        {!isLoggedIn ? (
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg">
            <Link to="/profile">Go to Profile</Link>
          </Button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>Learn Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse our catalog of available skills and connect with teachers.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Teach Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share your expertise and help others learn new skills.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build your network with like-minded individuals in our community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
