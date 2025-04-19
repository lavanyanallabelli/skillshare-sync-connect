import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, parse, addHours, subHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { Trash2 } from "lucide-react";

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

      const updatedTimes = { ...selectedTimes };
      updatedTimes[date] = updatedTimes[date].filter(t => t !== time);
      
      if (updatedTimes[date].length === 0) {
        delete updatedTimes[date];
      }
      
      setSelectedTimes(updatedTimes);

      toast({
        title: "Availability deleted",
        description: "The time slot has been removed from your schedule",
      });
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      });
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate || !userId) return;

    try {
      // Format the date in YYYY-MM-DD format without timezone conversion
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const selectedTimesForDate = availabilityTimes.filter(time => {
        const checkbox = document.querySelector(`input[type="checkbox"][data-time="${time}"]`) as HTMLInputElement;
        return checkbox?.checked;
      });

      await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', userId)
        .eq('day', dateKey);

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

            {Object.keys(selectedTimes).length > 0 && (
              <div className="space-y-2">
                <Label>Your Availability</Label>
                {Object.entries(selectedTimes).map(([date, times]) => (
                  <div key={date} className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{format(new Date(date), "MMMM d, yyyy")}</h3>
                    <div className="space-y-2">
                      {times.map((time) => (
                        <div key={time} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <span>{time}</span>
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
            )}

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
