
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewCard from "../ReviewCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ReviewsTabProps {
  reviews: any[];
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews</CardTitle>
          <Button variant="outline" asChild>
            <Link to="/reviews">View All Reviews</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  name={review.userName}
                  avatar={review.userAvatar}
                  rating={review.rating}
                  date={review.date}
                  comment={review.comment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reviews yet</p>
              <p className="text-sm mt-2">
                Reviews will appear here after sessions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab;
