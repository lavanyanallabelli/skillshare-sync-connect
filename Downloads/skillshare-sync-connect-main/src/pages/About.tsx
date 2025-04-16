
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, MessageSquare, Star, Shield } from "lucide-react";

const AboutPage: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Find Your Skill Match",
      description: "Search our extensive catalog of skills and find the perfect teacher or student based on your interests and goals.",
      icon: Search,
      color: "bg-skill-purple",
    },
    {
      id: 2,
      title: "Schedule Sessions",
      description: "Book flexible one-on-one sessions that fit your availability and learning pace using our integrated calendar.",
      icon: Calendar,
      color: "bg-skill-teal",
    },
    {
      id: 3,
      title: "Connect & Learn",
      description: "Chat in real-time, share resources, and grow your skills through personalized learning experiences.",
      icon: MessageSquare,
      color: "bg-skill-orange",
    },
    {
      id: 4,
      title: "Review & Grow",
      description: "After sessions, provide feedback to help the community and continuously improve your teaching or learning.",
      icon: Star,
      color: "bg-amber-500",
    },
  ];

  const safetyFeatures = [
    "Verified user profiles with identity verification",
    "Secure messaging system with content filtering",
    "Session recording options for accountability",
    "Community reporting system for concerns",
    "Transparent review system",
  ];

  return (
    <MainLayout>
      <div className="py-20 hero-gradient text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How SkillSync Works</h1>
            <p className="text-xl mb-8 text-white/90">
              A simple process to connect, teach, and learn in our global community.
            </p>
          </div>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The SkillSync Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to connect with others and share knowledge through a streamlined process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-muted">
                  <div className={`rounded-full ${step.color} p-3 text-white`}>
                    <step.icon size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="relative mt-16">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border hidden lg:block" />
            <div className="relative flex justify-between max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-muted bg-background font-medium"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Teachers</h2>
              <p className="mb-4">
                Share your expertise and earn while helping others grow. As a teacher on SkillSync, you can:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Create custom skill listings that showcase your expertise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Set your own availability and rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Build your teaching portfolio with verified reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Connect with motivated students from around the world</span>
                </li>
              </ul>
              <Link to="/teach">
                <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                  Start Teaching
                </Button>
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">For Learners</h2>
              <p className="mb-4">
                Find the perfect teacher and develop new skills at your own pace. As a learner on SkillSync, you can:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Browse teachers by skill, rating, and availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Book sessions that fit your schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Track your progress and build your skill portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-green-500/10 p-1 text-green-500">✓</span>
                  <span>Learn directly from experienced practitioners, not just courses</span>
                </li>
              </ul>
              <Link to="/explore">
                <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Safety and Trust" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/10 p-2 rounded-full text-red-500">
                  <Shield size={24} />
                </div>
                <h2 className="text-3xl font-bold">Safety & Trust</h2>
              </div>
              <p className="mb-6">
                We take the safety and security of our community seriously. Our platform includes several features designed to create a safe learning environment:
              </p>
              <ul className="space-y-3">
                {safetyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="rounded-full bg-red-500/10 p-1 text-red-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 purple-gradient">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-white/90 mb-8 text-lg">
              Join our community of teachers and learners today. Start sharing or developing your skills.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-white text-skill-purple hover:bg-white/90">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Explore Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage;
