
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import {
  Star,
  MapPin,
  Building,
  GraduationCap,
  Award,
  CheckCircle,
  MessageSquare,
  Video,
  Edit,
  Pencil
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  id?: string;
  name: string;
  avatar: string;
  rating: number;
  location: string;
  company: string;
  education: string;
  achievements: string[];
  teachingSkills: string[];
  learningSkills: string[];
  bio?: string;
  isOwnProfile?: boolean;
  onMessageClick?: () => void;
  onBookSessionClick?: () => void;
  onUpdateProfile?: (profileData: any) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  id,
  name,
  avatar,
  rating,
  location,
  company,
  education,
  achievements,
  teachingSkills,
  learningSkills,
  bio,
  isOwnProfile = false,
  onMessageClick,
  onBookSessionClick,
  onUpdateProfile
}) => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const isTeacherProfile = pathname.includes("/teacher/");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editLocation, setEditLocation] = useState(location);
  const [editCompany, setEditCompany] = useState(company);
  const [editEducation, setEditEducation] = useState(education);
  const [editBio, setEditBio] = useState(bio || "");

  const handleSaveProfile = () => {
    const updatedProfile = {
      name: editName,
      location: editLocation,
      company: editCompany,
      education: editEducation,
      bio: editBio
    };
    
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    
    setEditDialogOpen(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully"
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and action buttons */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-skill-purple">
              <AvatarImage src={avatar} alt={`${name}'s avatar`} />
              <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            {isOwnProfile && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-skill-purple hover:bg-skill-purple-dark"
                    size="icon"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="company">Occupation</Label>
                      <Input
                        id="company"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        value={editEducation}
                        onChange={(e) => setEditEducation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-skill-purple hover:bg-skill-purple-dark">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {!isOwnProfile && (
            <div className="flex flex-col gap-2 w-full">
              <Button 
                className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                onClick={onMessageClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onBookSessionClick}
              >
                <Video className="mr-2 h-4 w-4" /> Book a Session
              </Button>
            </div>
          )}
        </div>
        
        {/* User info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {rating.toFixed(1)}
              </Badge>
              
              {location && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {location}
                </span>
              )}
              
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
            
            {bio && (
              <div className="mt-3 text-sm text-gray-600">
                {bio}
              </div>
            )}
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
                {isOwnProfile && (
                  <Link to="/skills" className="text-xs text-skill-purple hover:underline">
                    Edit
                  </Link>
                )}
              </h3>
              <div className="flex flex-wrap gap-1">
                {teachingSkills.length > 0 ? (
                  teachingSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="m-1">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills added yet</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                <span>I want to learn</span>
                {isOwnProfile && (
                  <Link to="/skills" className="text-xs text-skill-purple hover:underline">
                    Edit
                  </Link>
                )}
              </h3>
              <div className="flex flex-wrap gap-1">
                {learningSkills.length > 0 ? (
                  learningSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="m-1">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills added yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
