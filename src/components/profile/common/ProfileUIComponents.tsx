
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, X } from 'lucide-react';

export const ProfileBio: React.FC<{
  bio: string;
  editing: boolean;
  onEdit: () => void;
  onSave: (bio: string) => void;
  onCancel: () => void;
  isEditable: boolean;
}> = ({ bio, editing, onEdit, onSave, onCancel, isEditable }) => {
  const [editedBio, setEditedBio] = useState(bio);

  const handleSave = () => {
    onSave(editedBio);
  };

  const handleCancel = () => {
    setEditedBio(bio);
    onCancel();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">About</h3>
        {isEditable && (
          <>
            {editing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </>
        )}
      </div>

      {editing ? (
        <Textarea
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          placeholder="Write something about yourself..."
          className="min-h-[120px]"
        />
      ) : (
        <p className="text-muted-foreground">
          {bio || "No bio information provided yet."}
        </p>
      )}
    </div>
  );
};
