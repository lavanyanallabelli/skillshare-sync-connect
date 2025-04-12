
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Building,
  GraduationCap,
  Award,
  CheckCircle,
  MessageSquare,
  Video
} from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  avatar: string;
  rating: number;
  location: string;
  company: string;
  education: string;
  achievements: string[];
  teachingSkills: string[];
  learningSkills: string[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  rating,
  location,
  company,
  education,
  achievements,
  teachingSkills,
  learningSkills
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatar} alt={`${name}'s avatar`} />
          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{name}</h1>
          
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 my-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> {rating.toFixed(1)}
            </Badge>
            
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" /> {location}
            </span>
            
            {company && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building className="h-3 w-3" /> {company}
              </span>
            )}
            
            {education && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <GraduationCap className="h-3 w-3" /> {education}
              </span>
            )}
          </div>
          
          {achievements.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              {achievements.map((achievement, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {achievement.includes("Top") ? (
                    <Award className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {achievement}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Button>
          <Button variant="outline" className="w-full">
            <Video className="mr-2 h-4 w-4" /> Book a Session
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-sm font-medium mb-2 flex justify-between">
            <span>I can teach</span>
            <Link to="/skills" className="text-xs text-skill-purple">Edit</Link>
          </h3>
          <div className="flex flex-wrap">
            {teachingSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="m-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex justify-between">
            <span>I want to learn</span>
            <Link to="/skills" className="text-xs text-skill-purple">Edit</Link>
          </h3>
          <div className="flex flex-wrap">
            {learningSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="m-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
