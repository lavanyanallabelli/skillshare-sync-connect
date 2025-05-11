import React, { useState, useEffect } from "react";
import { Calendar } from "react-day-picker";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleTabProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availabilityTimes: string[];
  selectedTimes: Record<string, string[]>;
  setSelectedTimes: (times: Record<string, string[]>) => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  selectedDate,
  setSelectedDate,
  availabilityTimes,
  selectedTimes,
  setSelectedTimes
}) => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_availability')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error("Error fetching availability:", error);
          toast({
            title: "Error",
            description: "Failed to fetch availability. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Transform the fetched data into the expected format
        const transformedTimes: Record<string, string[]> = {};
        data.forEach(item => {
          if (!transformedTimes[item.day]) {
            transformedTimes[item.day] = [];
          }
          transformedTimes[item.day].push(item.time_slot);
        });

        setSelectedTimes(transformedTimes);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast({
          title: "Error",
          description: "Failed to fetch availability. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchAvailability();
  }, [userId, setSelectedTimes]);

  const handleDaySelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select a time",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to set availability",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Check if the time slot is already selected for the date
    if (selectedTimes[formattedDate]?.includes(selectedTime)) {
      toast({
        title: "Error",
        description: "This time slot is already selected for this date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_availability')
        .insert({
          user_id: userId,
          day: formattedDate,
          time_slot: selectedTime,
        });

      if (error) {
        console.error("Save availability error:", error);
        throw error;
      }

      // Update the selectedTimes state
      setSelectedTimes(prevTimes => {
        const updatedTimes = { ...prevTimes };
        if (!updatedTimes[formattedDate]) {
          updatedTimes[formattedDate] = [];
        }
        updatedTimes[formattedDate] = [...updatedTimes[formattedDate], selectedTime];
        return updatedTimes;
      });

      toast({
        title: "Availability Saved",
        description: `The time slot ${selectedTime} has been saved for ${format(selectedDate, "MMMM d, yyyy")}`,
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Availability</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="time">Select Time</Label>
            <Select onValueChange={handleTimeSelect}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {availabilityTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveAvailability}>Save Availability</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
