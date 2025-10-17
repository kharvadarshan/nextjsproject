

// getting user draft 
import { query,mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getUserDraft = query({
    handler:async(ctx) => {
         const user = await ctx.runQuery(internal.user.getCurrentUser);

         const draft = await ctx.db
            .query("posts")
            .filter(q=>q.and(
            q.eq(q.field("authorId"),user._id),
            q.eq(q.field("status"),"draft") 
            ))
            .unique();

            return draft;
    }
});


// cerate new post 

export const createPost = mutation({
    args:{
        title:v.string(),
        content:v.string(),
        status:v.union(v.literal("draft"),v.literal("published")),
        tags:v.optional( v.array(v.string())) ,
        category:v.optional(v.string()),
        featuredImage: v.optional(v.string()),
        scheduledFor:v.optional(v.number()),
    },
    handler:async(ctx,args)=>{
         const user = await ctx.runQuery(internal.user.getCurrentUser);
         
           const existingDraft  = await ctx.db
            .query("posts")
            .filter(q=>q.and(
            q.eq(q.field("authorId"),user._id),
            q.eq(q.field("status"),"draft") 
            ))
            .unique();

        const now = Date.now();

        // if publishing and we have an existing draft, update it to published 
           
           if(args.status==="published" && existingDraft)
           {
               await ctx.db.patch(existingDraft._id,{
                  title:args.title,
                  content:args.content,
                  status:"published",
                  tags:args.tags || [],
                  category: args.category,
                  featuredImage: args.featuredImage,
                  updatedAt:now,
                  publishedAt: now,
                  scheduledFor:args.scheduledFor,
               });

               return existingDraft._id;
           }
         
          // if creating a draft and we have an existing draft, update it 
           if(args.status === "draft" && existingDraft )
           {
                   await ctx.db.patch(existingDraft._id,{
                  title:args.title,
                  content:args.content,
                  tags:args.tags || [], 
                  category: args.category,
                  featuredImage: args.featuredImage,
                  scheduledFor:args.scheduledFor,
                  updatedAt:now(),
               });

               return existingDraft._id;
           }

           //  create new post ( either first draft or direct publish )

           const postId = await ctx.db.insert("posts",{
            title:args.title,
            content:args.content,
            status:args.status,
            authorId:user._id,
            tags:args.tags || [],
            category:args.category,
            featuredImage: args.featuredImage,
            createdAt:now,
            updatedAt:now,
            publishedAt: args.status === "published" ? now : undefined,
            scheduledFor: args.scheduledFor,
            viewCount: 0,
            likeCount: 0,
           });


           return postId;  
    }
})


// update an existing post 
export const updatePost = mutation({
    args:{
        id: v.id("posts"),
        title:v.string(),
        content:v.string(),
        status:v.union(v.literal("draft"),v.literal("published")),
        tags:v.optional( v.array(v.string())) ,
        category:v.optional(v.string()),
        featuredImage: v.optional(v.string()),
        scheduledFor:v.optional(v.number()),
    },
    handler:async(ctx,args)=>{
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        const post = await ctx.db.get(args.id);

        if(!post)
        {
            throw new Error("Post not found");
        }

        if(post.authorId !== user._id){
            throw new Error("Not authorized to update this post");
        }

        const now = Date.now();
        const updateData = {
            updatedAt:now,
        }

        if(args.title !== undefined) updateData.title = args.title;
        if(args.content !== undefined) updateData.content = args.content;
        if(args.tags !== undefined) updateData.tags = args.tags;
        if(args.category !== undefined) updateData.category = args.category;
        if(args.featuredImage !== undefined) updateData.featuredImage = args.featuredImage;
        if(args.scheduledFor !== undefined) updateData.scheduledFor = args.scheduledFor;

        if(args.status !== undefined)
        {
            updateData.status = args.status;

            if(args.status==="published" && post.status === "draft")
            {
                updateData.publishedAt = now;
            }
        }

        await ctx.db.patch(args.id,updateData);

        return args.id;
    }
})
