import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, parse, addHours, subHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";

interface ScheduleTabProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimes: Record<string, string[]>;
  setSelectedTimes: (times: Record<string, string[]>) => void;
  availabilityTimes: string[];
  onSave?: () => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTimes,
  setSelectedTimes,
  availabilityTimes,
  onSave
}) => {
  const { toast } = useToast();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from('user_availability')
        .select('day, time_slot')
        .eq('user_id', userId)
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching availability:', error);
        return;
      }

      const availabilityMap = data.reduce((acc: Record<string, string[]>, curr) => {
        const dateKey = curr.day;
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(curr.time_slot);
        return acc;
      }, {});

      setSelectedTimes(availabilityMap);
    };

    fetchAvailability();
  }, [userId]);

  const handleSaveAvailability = async () => {
    if (!selectedDate || !userId) return;

    try {
      // Format the date in YYYY-MM-DD format without timezone conversion
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const selectedTimesForDate = availabilityTimes.filter(time => {
        const checkbox = document.querySelector(`input[type="checkbox"][data-time="${time}"]`) as HTMLInputElement;
        return checkbox?.checked;
      });

      // Delete existing availability for this date
      await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', userId)
        .eq('day', dateKey);

      // Insert new availability
      if (selectedTimesForDate.length > 0) {
        const availability = selectedTimesForDate.map(time => ({
          user_id: userId,
          day: dateKey,
          time_slot: time,
          is_available: true
        }));

        const { error } = await supabase
          .from('user_availability')
          .insert(availability);

        if (error) throw error;
      }

      const updatedTimes = {
        ...selectedTimes,
        [dateKey]: selectedTimesForDate
      };

      setSelectedTimes(updatedTimes);

      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully",
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mt-2"
              />
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label>Available Times for {format(selectedDate, "MMMM d, yyyy")}</Label>
                <div className="space-y-2">
                  {availabilityTimes.map((time) => {
                    const dateKey = format(selectedDate, 'yyyy-MM-dd');
                    const isSelected = selectedTimes[dateKey]?.includes(time);
                    return (
                      <div key={time} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`time-${time}`}
                          data-time={time}
                          checked={isSelected}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const dateKey = format(selectedDate, 'yyyy-MM-dd');
                            const updatedTimes = selectedTimes[dateKey] || [];
                            if (e.target.checked) {
                              updatedTimes.push(time);
                            } else {
                              const index = updatedTimes.indexOf(time);
                              if (index > -1) {
                                updatedTimes.splice(index, 1);
                              }
                            }

                            const newSelectedTimes = {
                              ...selectedTimes,
                              [dateKey]: updatedTimes
                            };

                            setSelectedTimes(newSelectedTimes);
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`time-${time}`}>{time}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSaveAvailability} className="bg-skill-purple">
                Save Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
