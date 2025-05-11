import React from 'react';
import { DayPicker } from 'react-day-picker';
import { useAuth } from "@/contexts/AuthContext";
import 'react-day-picker/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, X } from 'lucide-react';

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
  availabilityTimes,
}) => {
  const { userId } = useAuth();
  
  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const currentTimes = selectedTimes[dateStr] || [];
    
    if (currentTimes.includes(time)) {
      // Remove time if already selected
      const updatedTimes = { ...selectedTimes };
      updatedTimes[dateStr] = currentTimes.filter(t => t !== time);
      
      if (updatedTimes[dateStr].length === 0) {
        delete updatedTimes[dateStr];
      }
      
      setSelectedTimes(updatedTimes);
    } else {
      // Add time if not already selected
      setSelectedTimes({
        ...selectedTimes,
        [dateStr]: [...currentTimes, time],
      });
    }
  };
  
  const isTimeSelected = (time: string): boolean => {
    if (!selectedDate) return false;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return selectedTimes[dateStr]?.includes(time) || false;
  };
  
  const getSelectedDatesCount = (): number => {
    return Object.keys(selectedTimes).length;
  };
  
  const getSelectedTimesCount = (): number => {
    return Object.values(selectedTimes).reduce((acc, times) => acc + times.length, 0);
  };
  
  const handleSaveAvailability = async () => {
    if (!userId) return;
    
    try {
      // API call to save availability would go here
      console.log('Saving availability for user', userId, selectedTimes);
      
      // Example success message
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Available Dates</h3>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-md p-3"
                modifiersClassNames={{
                  selected: 'bg-primary text-primary-foreground',
                }}
                modifiers={{
                  booked: Object.keys(selectedTimes).map(dateStr => new Date(dateStr)),
                }}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {selectedDate ? (
                  <>Select Times for {format(selectedDate, 'MMMM d, yyyy')}</>
                ) : (
                  <>Select a date first</>
                )}
              </h3>
              
              {selectedDate ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availabilityTimes.map((time) => (
                    <Button
                      key={time}
                      variant={isTimeSelected(time) ? "default" : "outline"}
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleTimeSelect(time)}
                    >
                      <Clock className="h-4 w-4" />
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Please select a date from the calendar to set available times.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Selected Availability</h3>
          
          {getSelectedDatesCount() > 0 ? (
            <div className="space-y-4">
              <p>
                You have selected {getSelectedDatesCount()} day(s) with a total of{" "}
                {getSelectedTimesCount()} time slot(s).
              </p>
              
              <div className="space-y-2">
                {Object.entries(selectedTimes).map(([dateStr, times]) => (
                  <div key={dateStr} className="border rounded-md p-3">
                    <div className="font-medium">{format(new Date(dateStr), 'MMMM d, yyyy')}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {times.map((time) => (
                        <Badge key={time} variant="secondary" className="flex items-center gap-1">
                          {time}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleTimeSelect(time)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={handleSaveAvailability} className="w-full">
                Save Availability
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No availability selected yet. Use the calendar above to select dates and times.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
