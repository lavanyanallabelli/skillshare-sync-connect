
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and action buttons */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-skill-purple">
            <AvatarImage src={avatar} alt={`${name}'s avatar`} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-2 w-full">
            <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button variant="outline" className="w-full">
              <Video className="mr-2 h-4 w-4" /> Book a Session
            </Button>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {rating.toFixed(1)}
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
          </div>
          
          {/* Achievements */}
          {achievements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {achievement.includes("Top") ? (
                      <Award className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                <span>I can teach</span>
                <Link to="/skills" className="text-xs text-skill-purple hover:underline">
                  Edit
                </Link>
              </h3>
              <div className="flex flex-wrap gap-1">
                {teachingSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="m-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                <span>I want to learn</span>
                <Link to="/skills" className="text-xs text-skill-purple hover:underline">
                  Edit
                </Link>
              </h3>
              <div className="flex flex-wrap gap-1">
                {learningSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="m-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
