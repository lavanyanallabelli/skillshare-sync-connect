
import React from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCardProps {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  name,
  avatar,
  rating,
  date,
  comment,
}) => {
  return (
    <div key={id} className="border-b pb-6 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{name}</h4>
            <div className="flex items-center mt-1">
              {Array(5).fill(0).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <p className="mt-3">{comment}</p>
    </div>
  );
};

export default ReviewCard;
