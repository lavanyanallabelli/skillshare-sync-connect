import React, { useState, useEffect } from "react";
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
  Pencil,
  Plus,
  X,
  Briefcase,
  BookOpen,
  Award as AwardIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ProfileHeaderProps {
  id?: string;
  name: string;
  avatar: string;
  rating: number;
  location: string;
  company: string;
  education: string;
  achievements: string[];
  bio?: string;
  isOwnProfile?: boolean;
  onMessageClick?: () => void;
  onBookSessionClick?: () => void;
  onUpdateProfile?: (profileData: any) => void;
  upcomingSessions?: any[];
  setActiveTab?: (tab: string) => void;
  teachingSkills?: string[];
  learningSkills?: string[];
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
  bio,
  isOwnProfile = false,
  onMessageClick,
  onBookSessionClick,
  onUpdateProfile,
  upcomingSessions,
  setActiveTab,
  teachingSkills = [],
  learningSkills = []
}) => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const isTeacherProfile = pathname.includes("/teacher/");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name || "");
  const [editLocation, setEditLocation] = useState(location || "");
  const [editCompany, setEditCompany] = useState(company || "");
  const [editBio, setEditBio] = useState(bio || "");

  // Update local state when props change
  useEffect(() => {
    if (name) setEditName(name);
    if (location) setEditLocation(location);
    if (company) setEditCompany(company);
    if (bio) setEditBio(bio);
  }, [name, location, company, bio]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { name, location, company, bio } = event.detail;
      if (name) setEditName(name);
      if (location) setEditLocation(location);
      if (company) setEditCompany(company);
      if (bio) setEditBio(bio);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    const updatedProfile = {
      name: editName.trim(),
      location: editLocation.trim(),
      company: editCompany.trim(),
      bio: editBio.trim()
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
      // Update local state immediately
      setEditName(updatedProfile.name);
      setEditLocation(updatedProfile.location);
      setEditCompany(updatedProfile.company);
      setEditBio(updatedProfile.bio);
    }

    setEditDialogOpen(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully"
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 relative">
      {isOwnProfile && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="absolute top-4 right-4 h-8 w-8 rounded-full p-0 bg-skill-purple hover:bg-skill-purple-dark"
              size="icon"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Current Company</Label>
                <Input
                  id="company"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and action buttons */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-skill-purple">
              <AvatarImage src={avatar} alt={`${name}'s avatar`} />
              <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
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
        <div className="flex-1">
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
            </div>

            {bio && (
              <div className="mt-3 text-sm text-gray-600">
                {bio}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mt-4">
            {teachingSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Skills I Teach</h3>
                <div className="flex flex-wrap gap-2">
                  {teachingSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {learningSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Skills I Want to Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {learningSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="mt-4">
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
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

