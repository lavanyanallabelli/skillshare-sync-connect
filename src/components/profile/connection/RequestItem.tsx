
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Clock, LinkIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useConnections } from "@/contexts/ConnectionContext";
import { supabase } from "@/integrations/supabase/client";

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    occupation: string | null;
  };
  isOutgoing: boolean;
};

interface RequestItemProps {
  request: Connection;
}

const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
  const { handleAcceptRequest, handleRejectRequest, handleCancelRequest, isProcessing } = useConnections();
  const [localProcessing, setLocalProcessing] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [profileData, setProfileData] = React.useState<any>(request.profile);
  
  // Check for profile data if it's incomplete
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!request.profile?.first_name) {
        try {
          const profileId = request.isOutgoing ? request.recipient_id : request.requester_id;
          
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, occupation')
            .eq('id', profileId)
            .single();
            
          if (error) throw error;
          if (data) {
            console.log("[RequestItem] Fetched missing profile data:", data);
            setProfileData(data);
          }
        } catch (err) {
          console.error("[RequestItem] Error fetching profile data:", err);
        }
      }
    };
    
    fetchProfileData();
  }, [request]);
  
  // Don't render if this item has been deleted locally
  if (isDeleted) {
    return null;
  }
  
  const onAccept = async () => {
    setLocalProcessing(true);
    try {
      await handleAcceptRequest(request.id);
      setIsDeleted(true);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const onReject = async () => {
    setLocalProcessing(true);
    try {
      await handleRejectRequest(request.id);
      setIsDeleted(true);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const onCancel = async () => {
    setLocalProcessing(true);
    try {
      await handleCancelRequest(request.id);
      setIsDeleted(true);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const isButtonDisabled = isProcessing || localProcessing;
  
  // Use profile data from state (allows for fetching missing profile info)
  const displayName = `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 'Unknown User';
  const avatarUrl = profileData?.avatar_url || "/placeholder.svg";
  const occupation = profileData?.occupation || '';
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={avatarUrl} 
            alt={displayName}
          />
          <AvatarFallback>
            {profileData?.first_name?.[0] || '?'}{profileData?.last_name?.[0] || ''}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link 
            to={`/teacher/${profileData?.id}`}
            className="font-medium hover:underline flex items-center gap-1"
          >
            {displayName}
            <LinkIcon size={12} />
          </Link>
          {occupation && (
            <p className="text-sm text-muted-foreground">{occupation}</p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            {request.isOutgoing ? 'Request sent' : 'Wants to connect with you'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {request.isOutgoing ? (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onCancel}
            disabled={isButtonDisabled}
          >
            {localProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <UserX size={14} className="mr-1" />}
            Cancel
          </Button>
        ) : (
          <>
            <Button 
              size="sm" 
              className="bg-skill-purple" 
              onClick={onAccept}
              disabled={isButtonDisabled}
            >
              {localProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <UserCheck size={14} className="mr-1" />}
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onReject}
              disabled={isButtonDisabled}
            >
              {localProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <UserX size={14} className="mr-1" />}
              Decline
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestItem;
