
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface AvailabilityTabProps {
  selectedTimes: Record<string, string[]>;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ selectedTimes }) => {
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
                  <div className="space-y-1">
                    {times.map((time) => (
                      <p key={time} className="text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-2" /> {time}
                      </p>
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
