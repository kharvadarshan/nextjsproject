import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function useStoreUser() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useUser();
  
  const [userId, setUserId] = useState(null);
  const [isStoring, setIsStoring] = useState(false);
  const storeUser = useMutation(api.user.store);

  useEffect(() => {
    console.log("🔄 useStoreUser effect:", {
      isAuthenticated,
      isSignedIn,
      clerkUser: clerkUser?.id,
      userId
    });

    // If not authenticated with Convex OR not signed in with Clerk, reset
    if (!isAuthenticated || !isSignedIn || !clerkUser) {
      setUserId(null);
      return;
    }

    // Only store user if we haven't already stored them
    if (userId === null) {
      async function createUser() {
        console.log("📝 Storing user in Convex...");
        setIsStoring(true);
        try {
          const id = await storeUser();
          console.log("✅ User stored with ID:", id);
          setUserId(id);
        } catch (error) {
          console.error("❌ Failed to store user:", error);
        } finally {
          setIsStoring(false);
        }
      }
      createUser();
    }
  }, [isAuthenticated, isSignedIn, clerkUser?.id, userId]);

  return {
    userId,
    isLoading: convexLoading || !clerkLoaded || isStoring,
    isAuthenticated: isAuthenticated && userId !== null,
  };
}


// import { useUser } from "@clerk/nextjs";
// import { useConvexAuth } from "convex/react";
// import { useEffect, useState } from "react";
// import { useMutation } from "convex/react";
// import { api } from "../convex/_generated/api";

// export default function useStoreUser() {
//   const { isAuthenticated,isLoading } = useConvexAuth();
//   const { user } = useUser();
//   // When this state is set we know the server
//   // has stored the user.
//   const [userId, setUserId] = useState(null);
//   const storeUser = useMutation(api.user.store);
//   // Call the `storeUser` mutation function to store
//   // the current user in the `users` table and return the `Id` value.
//   useEffect(() => {
//     // If the user is not logged in don't do anything
//     if (!isAuthenticated) {
//       return;
//     }
//     // Store the user in the database.
//     // Recall that `storeUser` gets the user information via the `auth`
//     // object on the server. You don't need to pass anything manually here.
//     async function createUser() {
//       const id = await storeUser();
//       setUserId(id);
//     }
//     createUser();
//     return () => setUserId(null);
//     // Make sure the effect reruns if the user logs in with
//     // a different identity
//   }, [isAuthenticated, storeUser, user?.id]);
//   return {
//     isLoading: isLoading || (isAuthenticated && userId===null),
//     isAuthenticated: isAuthenticated && userId !== null,
//   };
// }





