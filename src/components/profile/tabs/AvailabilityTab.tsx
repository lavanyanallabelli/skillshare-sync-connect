
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface AvailabilityTabProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimes: Record<string, string[]>;
  setSelectedTimes: (times: Record<string, string[]>) => void;
  availabilityTimes: Record<string, string[]> | undefined;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTimes,
  setSelectedTimes,
  availabilityTimes,
}) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  useEffect(() => {
    if (selectedDate && availabilityTimes) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setSelectedTimes({
        ...selectedTimes,
        [formattedDate]: availabilityTimes[formattedDate] || []
      });
    }
  }, [selectedDate, availabilityTimes, setSelectedTimes]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const toggleTimeSlot = (time: string) => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const currentTimes = selectedTimes[formattedDate] || [];
    const isSelected = currentTimes.includes(time);
    
    const updatedTimes = isSelected
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];

    // Fixed the type error here
    setSelectedTimes({
      ...selectedTimes,
      [formattedDate]: updatedTimes
    });
  };

  const isTimeSlotSelected = (time: string): boolean => {
    if (!selectedDate) return false;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return selectedTimes[formattedDate]?.includes(time) || false;
  };

  const handleSaveAvailability = async () => {
    if (!userId) return;

    setIsSaving(true);

    try {
      // Delete existing availability for the selected date
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        const { error: deleteError } = await supabase
          .from('user_availability')
          .delete()
          .eq('user_id', userId)
          .eq('day', formattedDate);

        if (deleteError) {
          console.error("Error deleting availability:", deleteError);
          toast({
            title: "Error",
            description: "Failed to delete existing availability. Please try again.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Insert new availability entries
        const newAvailability = selectedTimes[formattedDate]?.map(time => ({
          user_id: userId,
          day: formattedDate,
          time_slot: time,
          is_available: true,
        })) || [];

        if (newAvailability.length > 0) {
          const { error: insertError } = await supabase
            .from('user_availability')
            .insert(newAvailability);

          if (insertError) {
            console.error("Error inserting availability:", insertError);
            toast({
              title: "Error",
              description: "Failed to save availability. Please try again.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }

        toast({
          title: "Availability saved",
          description: "Your availability has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>
          Choose the dates and times you are available for sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border-none shadow-none"
          />
        </div>
        {selectedDate ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center space-x-2">
                <Checkbox
                  id={time}
                  checked={isTimeSlotSelected(time)}
                  onCheckedChange={() => toggleTimeSlot(time)}
                />
                <label
                  htmlFor={time}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {time}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Please select a date to see available time slots.</p>
        )}
      </CardContent>
      <Button onClick={handleSaveAvailability} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Availability"}
      </Button>
    </Card>
  );
};

export default AvailabilityTab;
