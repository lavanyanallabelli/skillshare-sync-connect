
import React from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface ReviewProps {
  id: string;
  rating: number;
  comment: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  created_at: string;
}

const ReviewCard: React.FC<{ review: ReviewProps }> = ({ review }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.reviewer_avatar || "/placeholder.svg"} alt="Reviewer" />
          <AvatarFallback>
            {review.reviewer_name ? review.reviewer_name[0] : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{review.reviewer_name || "Anonymous"}</p>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {review.created_at ? format(new Date(review.created_at), "MMM d, yyyy") : ""}
            </p>
          </div>
          <p className="mt-2 text-sm">{review.comment}</p>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
