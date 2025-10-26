"use client"

import React, { useEffect } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import useStoreUser from "@/hooks/use-store-users";
import { BarLoader } from "react-spinners";
import Image from "next/image";
import Link  from "next/link";
import { usePathname,useRouter } from "next/navigation";
import { Button } from "./button";
import { LayoutDashboard } from "lucide-react";


const Header = () => {
  // const { isSignedIn, user: clerkUser } = useAuth();
  // const { isLoading: convexLoading, isAuthenticated: convexAuthenticated } = useConvexAuth();
  const { isLoading, isAuthenticated } = useStoreUser();

   const path = usePathname();
   const router = useRouter();
    

    if(path !== "/" && path !== "/feed" && path.split("/").length >= 2 )
    {
      return null;
    }

    useEffect(()=>{
      if(!isLoading && isAuthenticated && path === "/"){
        router.push("/feed");
      }
    },[isLoading,isAuthenticated,path,router]);


  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-2">
       
        <Link href={isAuthenticated ? "/feed" : "/" } className="flex-shrink-0">
          <Image 
            src="/logo.png"
            alt="creatr logo"
            width={96}
            height={32}
            className="h-8 sm:h-10 w-auto object-contain"
          /> 
        </Link>
        {
          path === "/" && (
            <div className="hidden lg:flex space-x-6 flex-1 justify-center">
                <Link
                   href="#features"
                   className="text-white font-medium transition-all duration-300 hover:text-purple-300 cursor-pointer">
                    Features
                </Link>
                <Link
                   href="#testimonials"
                   className="text-white font-medium transition-all duration-300 hover:text-purple-300 cursor-pointer">
                    Testimonials
                </Link>
            </div>
          )
        }
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

      
        <Unauthenticated>
          <SignInButton>
            <Button size="sm" variant="ghost">Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button variant="primary" size="sm" className="whitespace-nowrap">Get Started</Button>
          </SignUpButton>
        </Unauthenticated>

        <Authenticated>
          <Link href="/dashboard">
            <Button variant="outline" className="hidden sm:flex" size="sm">
              <LayoutDashboard className="h-4 w-4"/>
              <span className="hidden md:inline ml-2">Dashboard</span>
            </Button>
          </Link>
              <UserButton />
        </Authenticated>
          </div> 


        {isLoading && (
          <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
            <BarLoader width={"95%"} color="#D8B4FE"/>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

// "use client"

// import React from "react";
// import { SignInButton,SignUpButton,UserButton } from "@clerk/nextjs";
// import { Authenticated, Unauthenticated } from "convex/react";
// import useStoreUser from "@/hooks/use-store-users";
// import { BarLoader } from "react-spinners";


// const Header=()=>{
  
//    const {isLoading,isAuthenticated}=useStoreUser();


//     return(
//         <header  className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
//            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-2">
//             <Unauthenticated>
//               <SignInButton />
//               <SignUpButton>
//                 <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
//                   Sign Up
//                 </button>
//               </SignUpButton>
//             </Unauthenticated>
//             <Authenticated>
//               <UserButton />
//             </Authenticated>
//             {isLoading &&(
//               <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
//                 <BarLoader width={"95%"} color="#D8B4FE"/>
//               </div>
//             )}
//            </div>
//         </header>
//     )
// }

// export default Header;