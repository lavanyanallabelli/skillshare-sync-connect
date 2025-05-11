
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";

interface AvailabilityTabDisplayProps {
  selectedTimes: Record<string, string[]>;
  onDelete?: (date: string, time: string) => void;
  profileUserId: string;
}

const AvailabilityTabDisplay: React.FC<AvailabilityTabDisplayProps> = ({
  selectedTimes,
  onDelete,
  profileUserId,
}) => {
  const sortedDates = Object.keys(selectedTimes).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No availability times set yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Times</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="border-b pb-4 last:border-0">
            <h3 className="font-medium mb-2">
              {format(new Date(date), "EEEE, MMMM d, yyyy")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTimes[date]
                .sort()
                .map((time) => {
                  // Try to parse the time to display in a consistent format
                  const formattedTime = time.includes(":")
                    ? format(parse(time, "HH:mm", new Date()), "h:mm a")
                    : time;

                  return (
                    <Badge
                      key={time}
                      variant="outline"
                      className="py-1.5 px-2.5 flex items-center gap-1"
                    >
                      {formattedTime}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(date, time)}
                          className="ml-1.5 text-muted-foreground hover:text-destructive"
                          aria-label="Remove time"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  );
                })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AvailabilityTabDisplay;
