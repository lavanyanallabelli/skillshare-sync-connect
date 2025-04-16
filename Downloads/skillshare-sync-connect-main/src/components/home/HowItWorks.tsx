
import React from "react";
import { Search, Calendar, MessageSquare } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Find Your Skill Match",
    description: "Browse our extensive catalog of skills and find the perfect teacher or student.",
    icon: Search,
    color: "bg-skill-purple",
  },
  {
    id: 2,
    title: "Schedule Sessions",
    description: "Book flexible one-on-one sessions that fit your availability and learning pace.",
    icon: Calendar,
    color: "bg-skill-teal",
  },
  {
    id: 3,
    title: "Connect & Learn",
    description: "Chat in real-time, share resources, and grow your skills through personalized learning.",
    icon: MessageSquare,
    color: "bg-skill-orange",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How SkillSync Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple process to connect, teach, and learn in our global community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border hidden md:block" />
          <div className="relative flex justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
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
  );
};

export default HowItWorks;
