
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ScheduleTabProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimes: Record<string, string[]>;
  setSelectedTimes: (times: Record<string, string[]>) => void;
  availabilityTimes: string[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTimes,
  setSelectedTimes,
  availabilityTimes
}) => {
  const { toast } = useToast();

  const handleSaveAvailability = () => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const updatedSelectedTimes = {
        ...selectedTimes,
        [dateKey]: availabilityTimes.filter(time => {
          const checkbox = document.querySelector(`input[type="checkbox"][data-time="${time}"]`) as HTMLInputElement;
          return checkbox?.checked;
        })
      };
      setSelectedTimes(updatedSelectedTimes);

      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        userData.availability = updatedSelectedTimes;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully",
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
                    const dateKey = selectedDate.toISOString().split('T')[0];
                    const isSelected = selectedTimes[dateKey]?.includes(time);
                    return (
                      <div key={time} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`time-${time}`}
                          data-time={time}
                          checked={isSelected}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const dateKey = selectedDate.toISOString().split('T')[0];
                            const updatedTimes = selectedTimes[dateKey] || [];
                            if (e.target.checked) {
                              updatedTimes.push(time);
                            } else {
                              const index = updatedTimes.indexOf(time);
                              if (index > -1) {
                                updatedTimes.splice(index, 1);
                              }
                            }
                            setSelectedTimes({
                              ...selectedTimes,
                              [dateKey]: updatedTimes
                            });
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
              <Button onClick={handleSaveAvailability} className="w-full">
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
