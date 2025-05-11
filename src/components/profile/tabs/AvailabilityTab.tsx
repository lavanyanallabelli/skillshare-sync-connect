import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AvailabilityTabProps {
  selectedTimes: Record<string, string[]>;
  onDelete?: (date: string, time: string) => void;
  profileUserId: string;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  selectedTimes,
  onDelete,
  profileUserId
}) => {
  const { toast } = useToast();
  const { userId } = useAuth();

  const isProfileOwner = userId === profileUserId;

  const handleDeleteAvailability = async (date: string, time: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to delete availability",
        variant: "destructive",
      });
      return;
    }

    if (!isProfileOwner) {
      toast({
        title: "Error",
        description: "You are not authorized to delete this availability",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Deleting availability:", { date, time, userId });
      
      const { error } = await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', userId)
        .eq('day', date)
        .eq('time_slot', time);

      if (error) {
        console.error("Delete availability error:", error);
        throw error;
      }

      console.log("Availability deleted successfully");
      
      if (onDelete) {
        onDelete(date, time);
      }

      toast({
        title: "Availability Deleted",
        description: `The time slot ${formatTimeDisplay(time)} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to format time for display
  const formatTimeDisplay = (timeString: string) => {
    try {
      // Check if the time is already in HH:mm format (24-hour)
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
      }
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error, timeString);
      return timeString;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(selectedTimes).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(selectedTimes).map(([date, times]) => {
                // Ensure date is properly formatted for parsing
                let parsedDate;
                try {
                  parsedDate = parse(date, 'yyyy-MM-dd', new Date());
                } catch (error) {
                  console.error("Error parsing date:", error, date);
                  // Fallback to using the original date string
                  return (
                    <div key={date} className="border p-4 rounded-lg">
                      <h3 className="font-medium mb-2">{date} (format error)</h3>
                    </div>
                  );
                }

                return (
                  <div key={date} className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{format(parsedDate, "MMMM d, yyyy")}</h3>
                    <div className="space-y-2">
                      {times.map((time) => (
                        <div key={time} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span className="text-sm">{formatTimeDisplay(time)}</span>
                          </div>
                          {isProfileOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-100"
                              onClick={() => handleDeleteAvailability(date, time)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No availability set</p>
              <p className="text-sm mt-2">Go to the Schedule tab to set your availability</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityTab;
