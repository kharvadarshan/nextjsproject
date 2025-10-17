import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import ImageKit  from "imagekit";

// Synchronous validation of required environment variables to fail fast during module initialization.
const REQUIRED_ENV = [
    { name: 'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY', value: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY },
    { name: 'IMAGEKIT_PRIVATE_KEY', value: process.env.IMAGEKIT_PRIVATE_KEY },
    { name: 'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT', value: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT },
];

const missing = REQUIRED_ENV.filter(e => !e.value || e.value.trim() === '').map(e => e.name);
if (missing.length) {
    // Throwing an Error at module init makes serverless functions / dev servers fail fast with clear message.
    throw new Error(`Missing required ImageKit environment variables: ${missing.join(', ')}. Please set them in your environment.`);
}

const imagekit = new ImageKit({
         publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
         privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
         urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
    try{

        const { userId } = await auth();

        if(!userId)
        {
            return NextResponse.json({error:"Unauthorized"},{ status:401});
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const filename = formData.get("filename");

        if(!file){
            return NextResponse.json({ error:"No file provided"},{ status:400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const sanitizedFileName = filename?.replace(/[^a-zA-Z0-9._]/g,"_") || "upload";
        const uniqueFileName = `${userId}/${timestamp}_${sanitizedFileName}`;

        const uploadResponse = await imagekit.upload({
            file:buffer,
            fileName: uniqueFileName,
            folder: "/blog_images",
        });

         return NextResponse.json({
             success: true,
             url: uploadResponse.url,
             fileId: uploadResponse.fileId,
             width: uploadResponse.width,
             height: uploadResponse.height,
             size: uploadResponse.size,
             name: uploadResponse.name,
         });

    }catch(error)
    {
            console.error("ImageKit upload error:", error);
            return NextResponse.json(
             {
                success: false,
                error: "Failed to upload image",
                details: error.message,
             },
             { status: 500 }
            );
    }
}