
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, LinkIcon } from "lucide-react";
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

interface ConnectionItemProps {
  connection: Connection;
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ connection }) => {
  const { setConnectionToRemove, setIsRemoveDialogOpen } = useConnections();

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={connection.profile?.avatar_url || "/placeholder.svg"} 
            alt={`${connection.profile?.first_name} ${connection.profile?.last_name}`}
          />
          <AvatarFallback>
            {connection.profile?.first_name?.[0]}{connection.profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link 
            to={`/teacher/${connection.profile?.id}`}
            className="font-medium hover:underline flex items-center gap-1"
          >
            {connection.profile?.first_name} {connection.profile?.last_name}
            <LinkIcon size={12} />
          </Link>
          {connection.profile?.occupation && (
            <p className="text-sm text-muted-foreground">{connection.profile.occupation}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="flex items-center gap-1">
          <UserCheck size={14} /> Connected
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => {
            setConnectionToRemove(connection);
            setIsRemoveDialogOpen(true);
          }}
        >
          <UserX size={14} className="mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
};

export default ConnectionItem;
