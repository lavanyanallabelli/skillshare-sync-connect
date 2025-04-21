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
  onSave?: () => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTimes,
  setSelectedTimes,
  onSave
}) => {
  const [hour, setHour] = React.useState("12");
  const [minute, setMinute] = React.useState("00");
  const [ampm, setAmpm] = React.useState("AM");

  // Helper to convert 12-hour input to 24-hour 'HH:mm' string
  const get24HourTime = () => {
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };
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
      // Ensure dates are treated as local, not UTC, to avoid off-by-one errors.

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
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const selectedTimesForDate = selectedTimes[dateKey] || [];
      // Remove all for this date, then add new
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
      // Parent state is already updated via setSelectedTimes
      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully",
      });
      if (onSave) {
        onSave(); // Parent should setActiveTab('availability')
      }
      // (Optional fallback) Redirect to Availability tab after save if onSave is not provided
      if (!onSave && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'availability');
        window.history.replaceState({}, '', url.toString());
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
                <div className="flex items-center gap-2">
                  <select value={hour} onChange={e => setHour(e.target.value)} className="border rounded px-1 py-1">
                    {[...Array(12)].map((_, i) => {
                      const val = (i + 1).toString().padStart(2, "0");
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                  :
                  <select value={minute} onChange={e => setMinute(e.target.value)} className="border rounded px-1 py-1">
  {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")).map(m => (
    <option key={m} value={m}>{m}</option>
  ))}
</select>
                  <select value={ampm} onChange={e => setAmpm(e.target.value)} className="border rounded px-1 py-1">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!selectedDate) return;
                      const time24 = get24HourTime();
                      const dateKey = format(selectedDate, 'yyyy-MM-dd');
                      const timesForDate = selectedTimes[dateKey] || [];
                      if (timesForDate.includes(time24)) {
                        toast({ title: "Duplicate time", description: "This time slot is already added." });
                        return;
                      }
                      const updated = new Set(timesForDate);
                      updated.add(time24);
                      setSelectedTimes({
                        ...selectedTimes,
                        [dateKey]: Array.from(updated)
                      });
                      setHour("12");
                      setMinute("00");
                      setAmpm("AM");
                    }}
                    className="ml-2"
                  >
                    Add Time
                  </Button>
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
