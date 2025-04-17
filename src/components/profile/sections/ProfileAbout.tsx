
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";

interface ProfileAboutProps {
  bio: string;
  setBio: (bio: string) => void;
  editingBio: boolean;
  setEditingBio: (editing: boolean) => void;
  handleSaveBio: () => void;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({
  bio,
  setBio,
  editingBio,
  setEditingBio,
  handleSaveBio
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>About Me</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingBio(!editingBio)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editingBio ? (
          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Tell us about yourself, your interests, and what you want to learn or teach"
            />
            <Button size="sm" onClick={handleSaveBio} className="flex items-center gap-1">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        ) : (
          <p className="text-gray-700">
            {bio || "Add information about yourself, your interests, and what you want to learn or teach."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAbout;
