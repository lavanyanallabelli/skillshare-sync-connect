
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Clock, LinkIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useConnections } from "@/contexts/ConnectionContext";

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
  
  const onAccept = async () => {
    setLocalProcessing(true);
    try {
      await handleAcceptRequest(request.id);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const onReject = async () => {
    setLocalProcessing(true);
    try {
      await handleRejectRequest(request.id);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const onCancel = async () => {
    setLocalProcessing(true);
    try {
      await handleCancelRequest(request.id);
    } finally {
      setLocalProcessing(false);
    }
  };
  
  const isButtonDisabled = isProcessing || localProcessing;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={request.profile?.avatar_url || "/placeholder.svg"} 
            alt={`${request.profile?.first_name} ${request.profile?.last_name}`}
          />
          <AvatarFallback>
            {request.profile?.first_name?.[0]}{request.profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link 
            to={`/teacher/${request.profile?.id}`}
            className="font-medium hover:underline flex items-center gap-1"
          >
            {request.profile?.first_name} {request.profile?.last_name}
            <LinkIcon size={12} />
          </Link>
          {request.profile?.occupation && (
            <p className="text-sm text-muted-foreground">{request.profile.occupation}</p>
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
