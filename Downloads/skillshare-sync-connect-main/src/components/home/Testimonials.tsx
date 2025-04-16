
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Web Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    testimonial: "SkillSync transformed my learning journey. I found an amazing mentor who helped me improve my coding skills in just a few weeks!",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Photographer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    testimonial: "Teaching on SkillSync has been incredibly rewarding. I've connected with students worldwide and improved my own skills while helping others.",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Music Student",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    testimonial: "The one-on-one sessions with my guitar teacher have accelerated my progress dramatically. The scheduling system is so flexible!",
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners and teachers who are sharing skills and building connections on SkillSync.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card/50 backdrop-blur-sm border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < testimonial.rating ? "currentColor" : "none"} 
                    />
                  ))}
                </div>
                <p className="mb-6 text-foreground/90 italic">"{testimonial.testimonial}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
