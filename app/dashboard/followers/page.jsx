"use client";

import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  FileText, 
  Loader2,
  ArrowLeft,
  UserPlus,
  UserMinus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";


export default function DashboardFollowersPage() {
  const { user: currentUser, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});
  

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }
  // Get current user's followers
  const { 
    data: followers, 
    isLoading, 
    refetch 
  } = useConvexQuery(
    api.follow.getMyFollowers,
    isSignedIn ? {} : "skip"
  );

   useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);
  // Follow/unfollow mutation
  const toggleFollow = useConvexMutation(api.follow.toggleFollow);

  // If not signed in, redirect
  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const handleFollowToggle = async (followingId, username) => {
    if (!currentUser) {
      toast.error("Please sign in first");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [followingId]: true }));

    try {
      await toggleFollow.mutate({ followingId });
      refetch(); // Refresh the followers list
      toast.success(`Toggled follow for @${username}`);
    } catch (error) {
      toast.error(error.message || "Failed to follow/unfollow");
    } finally {
      setLoadingStates(prev => ({ ...prev, [followingId]: false }));
    }
  };

  const handleViewProfile = (username) => {
    router.push(`/${username}`);
  };

  const handleViewPost = (postId, username) => {
    router.push(`/${username}/${postId}`);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "No posts yet";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Calculate time since followed
  const timeSinceFollowed = (timestamp) => {
    const now = new Date();
    const followed = new Date(timestamp);
    const diffMs = now - followed;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary flex items-center gap-3">
                <Users className="h-8 w-8" />
                My Followers
              </h1>
              <p className="text-slate-400 mt-2">
                People who follow your content and updates
              </p>
            </div>
            
            <Badge variant="secondary" className="px-4 py-2 bg-purple-500/20 text-purple-300">
              {followers?.length || 0} Followers
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-slate-400">Loading your followers...</p>
          </div>
        ) : (
          <>
            {/* Followers Grid */}
            {followers && followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followers.map((follower) => (
                  <Card key={follower._id} className="card-glass border-slate-700">
                    <CardContent className="p-6">
                      {/* Follower Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                            <AvatarImage 
                              src={follower.imageUrl} 
                              alt={follower.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600">
                              {follower.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-white hover:text-purple-300 cursor-pointer">
                              <Link href={`/${follower.username}`}>
                                {follower.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-slate-400">
                              @{follower.username}
                            </p>
                          </div>
                        </div>
                        
                        {follower.followsBack && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                            Follows you
                          </Badge>
                        )}
                      </div>

                      {/* Follower Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-slate-400">Posts</span>
                          </div>
                          <p className="font-bold text-white">{follower.postCount || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-slate-400">Last Post</span>
                          </div>
                          <p className="text-xs font-medium text-slate-300">
                            {follower.lastPostAt ? formatDate(follower.lastPostAt) : "Never"}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-slate-400">Followed</span>
                          </div>
                          <p className="text-xs font-medium text-slate-300">
                            {timeSinceFollowed(follower.followedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewProfile(follower.username)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant={follower.followsBack ? "outline" : "primary"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleFollowToggle(follower._id, follower.username)}
                          disabled={loadingStates[follower._id]}
                        >
                          {loadingStates[follower._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : follower.followsBack ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-1" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Follow Back
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Empty State
              <Card className="card-glass border-slate-700">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    No followers yet
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Start creating and sharing content to attract followers. 
                    Share your posts on social media to get more visibility.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/dashboard/posts/create">
                      <Button variant="primary">
                        Create Your First Post
                      </Button>
                    </Link>
                    <Link href="/feed">
                      <Button variant="outline">
                        Explore Feed
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Summary */}
            {followers && followers.length > 0 && (
              <Card className="card-glass border-slate-700 mt-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Followers Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Total Followers</p>
                      <p className="text-2xl font-bold text-white">{followers.length}</p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Follow Back</p>
                      <p className="text-2xl font-bold text-green-400">
                        {followers.filter(f => f.followsBack).length}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">Active Posters</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {followers.filter(f => f.postCount > 0).length}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm text-slate-400">New This Week</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {followers.filter(f => {
                          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                          return new Date(f.followedAt).getTime() > weekAgo;
                        }).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}


// export default function DashboardFollowersPage() {
//   return (
//     <div>
//       <h1>Dashboard Followers</h1>
//       {/* Your dashboard followers content */}
//     </div>
//   );
// }