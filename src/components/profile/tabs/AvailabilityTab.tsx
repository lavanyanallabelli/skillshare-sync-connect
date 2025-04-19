
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";

interface AvailabilityTabProps {
  selectedTimes: Record<string, string[]>;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ selectedTimes }) => {
  const { toast } = useToast();
  const { userId } = useAuth();

  const handleDeleteAvailability = async (date: string, time: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', userId)
        .eq('day', date)
        .eq('time_slot', time);

      if (error) throw error;

      toast({
        title: "Availability deleted",
        description: "The time slot has been removed from your schedule",
      });

      // Trigger a refresh of the profile page
      const event = new CustomEvent('availabilityUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      });
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
              {Object.entries(selectedTimes).map(([date, times]) => (
                <div key={date} className="border p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{format(new Date(date), "MMMM d, yyyy")}</h3>
                  <div className="space-y-2">
                    {times.map((time) => (
                      <div key={time} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          <span>{time}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAvailability(date, time)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
