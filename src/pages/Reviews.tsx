import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "@/components/profile/ReviewCard";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Star } from "lucide-react";

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  recipientName?: string;
  skill?: string;
}

const Reviews = () => {
  const { isLoggedIn, userId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoggedIn) {
      fetchReviews();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, userId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Fetch all reviews
      const { data: allReviews, error: allReviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id,
          recipient_id,
          sessions:session_id (skill)
        `);

      if (allReviewsError) throw allReviewsError;

      // Get unique user IDs from the reviews
      const userIds = new Set<string>();
      if (allReviews) {
        allReviews.forEach(review => {
          userIds.add(review.reviewer_id);
          userIds.add(review.recipient_id);
        });
      }

      // Fetch user profiles for those IDs
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of user profiles for easy lookup
      const userProfileMap = new Map();
      if (userProfiles) {
        userProfiles.forEach(profile => {
          userProfileMap.set(profile.id, {
            name: `${profile.first_name} ${profile.last_name}`,
            avatar: profile.avatar_url || '/placeholder.svg'
          });
        });
      }

      // Transform the reviews with user information
      const formattedReviews = allReviews?.map(review => {
        const reviewerProfile = userProfileMap.get(review.reviewer_id);
        const recipientProfile = userProfileMap.get(review.recipient_id);
        
        return {
          id: review.id,
          name: reviewerProfile ? reviewerProfile.name : 'Unknown User',
          avatar: reviewerProfile ? reviewerProfile.avatar : '/placeholder.svg',
          rating: review.rating,
          date: new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          comment: review.comment || '',
          recipientName: recipientProfile ? recipientProfile.name : 'Unknown User',
          skill: review.sessions?.skill || 'Unknown Skill',
          reviewerId: review.reviewer_id,
          recipientId: review.recipient_id
        };
      }) || [];

      setReviews(formattedReviews);
      
      // Filter reviews for received and given
      if (userId) {
        setReceivedReviews(formattedReviews.filter(review => review.recipientId === userId));
        setGivenReviews(formattedReviews.filter(review => review.reviewerId === userId));
      }
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = () => {
    let filtered = activeTab === "all" 
      ? reviews 
      : activeTab === "received" 
        ? receivedReviews 
        : givenReviews;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        review => 
          review.name.toLowerCase().includes(term) || 
          review.recipientName?.toLowerCase().includes(term) ||
          review.comment.toLowerCase().includes(term) ||
          review.skill?.toLowerCase().includes(term)
      );
    }
    
    if (ratingFilter) {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    return filtered;
  };

  const averageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reviews</h1>
            <p className="text-muted-foreground">
              View and manage all learning session reviews
            </p>
          </div>
          
          {isLoggedIn && (
            <div className="flex items-center mt-4 md:mt-0">
              <div className="bg-background border rounded-lg px-4 py-2 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">
                  {averageRating(receivedReviews)} / 5 
                  <span className="text-sm text-muted-foreground ml-2">
                    ({receivedReviews.length} reviews)
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              {isLoggedIn && (
                <>
                  <TabsTrigger value="received">Reviews I've Received</TabsTrigger>
                  <TabsTrigger value="given">Reviews I've Given</TabsTrigger>
                </>
              )}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reviews, teachers or skills..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={ratingFilter || ""} onValueChange={(value) => setRatingFilter(value || null)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" ? "All Reviews" : 
               activeTab === "received" ? "Reviews I've Received" : 
               "Reviews I've Given"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredReviews().length > 0 ? (
              <div className="space-y-6">
                {filteredReviews().map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <ReviewCard
                      id={review.id}
                      name={review.name}
                      avatar={review.avatar}
                      rating={review.rating}
                      date={review.date}
                      comment={review.comment}
                    />
                    {activeTab === "all" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Teaching: {review.skill}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          To: {review.recipientName}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No reviews found</p>
                {searchTerm || ratingFilter ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setRatingFilter(null);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <p className="text-sm">
                    {activeTab === "received" 
                      ? "You haven't received any reviews yet." 
                      : activeTab === "given"
                        ? "You haven't given any reviews yet."
                        : "There are no reviews in the system."}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reviews;
