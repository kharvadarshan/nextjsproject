"use client";
import { useState } from "react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useRouter } from "next/navigation";
import { api  } from "@/convex/_generated/api";
import React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card,CardContent } from "@/components/ui/card";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from "@radix-ui/react-select";
import { Search,FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import PostCard from "@/components/post-card";
import { toast } from "sonner";


const PostPage = ()=>{
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy]= useState("newest");
    const router = useRouter();
    const { data:posts, isLoading } = useConvexQuery(api.posts.getUserPosts);
    const deletePost = useConvexMutation(api.posts.deletePost);

    console.log(posts);

    const filteredPosts = useMemo(()=>{
        if(!posts) return [];

        let filtered = posts.filter((post)=>{
                 const matchesSearch = post.title.toLowerCase()
                               .includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" || post.status === statusFilter;

            return matchesSearch && matchesStatus;

        });  

        filtered.sort((a,b)=>{
               switch(sortBy) {
                  case "newest":
                    return b.createdAt - a.createdAt;
                  case "oldest":
                    return a.createdAt - b.createdAt;
                  case "mostViews":
                    return b.viewCount - a.viewCount;
                  case "mostLikes":
                    return b.likeCount - a.likeCount;
                  case "alphabetical":
                    return a.title.localeCompare(b.title);
                  default:
                    return b.createdAt - a.createdAt;
               }
        });

       return filtered;
    },[posts,searchQuery,statusFilter,sortBy]);

    const handleEditPost = (post)=>{
      router.push(`/dashboard/posts/edit/${post._id}`);
    };

    const handleDeletePost=async(post)=>{
      if(!window.confirm("Are you sure you want to delete this post?"))
      {
        return;
      }

      try{

        await deletePost.mutate({id:post._id});
        toast.success("Post deleted successfully.")

      }catch(error)
      {
        toast.error("Failed to delete post");
      }
    };

    const handleDuplicatePost=()=>{};


     if (isLoading) {
     return <BarLoader width={"100%"} color="#D8B4FE"/>
    }

    return (
        <div className="space-y-6 p-4 lg:p-8">
           {/* Header */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text-primary">My Posts</h1>
                    <p className="text-slate-400 mt-2">
                        Manage and track your content performance
                    </p>
                </div>

                <Link href="/dashboard/create">
                    <Button variant="primary">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create New Post
                    </Button>
                </Link>
           </div>
         {/* Filters and Search */}
              {/* Filters and Search */}
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="mostViews">Most Views</SelectItem>
                <SelectItem value="mostLikes">Most Likes</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      { filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No posts found"
                : "No posts yet"}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first post to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/dashboard/create">
                <Button variant="primary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showActions={true}
              showAuthor={false}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onDuplicate={handleDuplicatePost}
            />
          ))}
        </div>
      )}
        </div>
    )
};

export default PostPage; 