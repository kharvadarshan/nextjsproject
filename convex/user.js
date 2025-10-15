import { mutation, query } from "./_generated/server";

export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("🔍 Store user identity:", identity);
    
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    console.log("📊 Found existing user:", user);

    if (user !== null) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      // Update last active time
      await ctx.db.patch(user._id, { lastActiveAt: Date.now() });
      return user._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    console.log("✅ Created new user with ID:", userId);
    return userId;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null; // Return null instead of throwing error for queries
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user; // Return null if user not found (don't throw error)
  }
});

// import { mutation } from "./_generated/server";
// import { query } from "./_generated/server";

// export const store = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Called storeUser without authentication present");
//     }

//     // Check if we've already stored this identity before.
//     // Note: If you don't want to define an index right away, you can use
//     // ctx.db.query("users")
//     //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
//     //  .unique();
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_token", (q) =>
//         q.eq("tokenIdentifier", identity.tokenIdentifier),
//       )
//       .unique();
//     if (user !== null) {
//       // If we've seen this identity before but the name has changed, patch the value.
//       if (user.name !== identity.name) {
//         await ctx.db.patch(user._id, { name: identity.name });
//       }
//       return user._id;
//     }
//     // If it's a new identity, create a new `User`.
//     return await ctx.db.insert("users", {
//       name: identity.name ?? "Anonymous",
//       tokenIdentifier: identity.tokenIdentifier,
//       email:identity.email,
//       imageUrl:identity.pictureUrl,
//       createdAt: Date.now(),
//       lastActiveAt: Date.now(),
//     });
//   },
// });

// export const getCurrentUser = query({
//     handler:async(ctx)=>{
//         const identity= await ctx.auth.getUserIdentity();

//         if(!identity){
//             throw new Error("Not Authenticated");
//         }

//         const user = await ctx.db
//                      .query("users")
//                      .withIndex("by_token",(q)=>{
//                         q.eq("tokenIdentifier",identity.tokenIdentifier)
//                      })
//                      .unique();

//         if(!user){
//             throw new Error("User not found");
//         }

//         return user;    
//     }
// })