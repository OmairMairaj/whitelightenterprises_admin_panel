import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// CORS headers helper
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
});

// Verify Cloudinary Configuration
const verifyCloudinaryConfig = () => {
  const requiredVars = {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missingVars.join(', ')}`);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Test configuration
  console.log('Cloudinary Configuration:', {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '****' : undefined,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '****' : undefined
  });
};

export async function POST(req) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  
  try {
    // Verify Cloudinary configuration first
    verifyCloudinaryConfig();

    const contentType = req.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Invalid content type. Must be multipart/form-data' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Determine resource type
    let resourceType = "raw"; // Default for PDFs and other documents
    if (file.type.includes("image")) {
      resourceType = "image";
    }

    // Extract filename without extension
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const fileExtension = file.name.split('.').pop();

    console.log(`Uploading ${file.name} as ${resourceType}`);

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: resourceType,
          format: fileExtension,
          public_id: fileNameWithoutExt,
      },
        (error, result) => {
          if (error) {
            console.error(`Cloudinary upload failed for ${file.name}:`, error);
            reject(error);
          } else {
            console.log("Upload result:", result);
            let previewUrl = null;

            // Generate preview URL based on file type
            if (file.type.includes("pdf")) {
              previewUrl = result.secure_url.replace("/upload/", "/upload/w_300,h_400,pg_1/");
            } else if (file.type.includes("image")) {
              previewUrl = result.secure_url;
            }

            resolve({
              secure_url: result.secure_url,
              preview: previewUrl,
              public_id: result.public_id,
              resource_type: resourceType,
              original_filename: fileNameWithoutExt
            });
          }
        }
      );

      uploadStream.end(buffer);
    });

    const uploadResult = await uploadPromise;

    return NextResponse.json(uploadResult, {
      status: 201,
      headers: corsHeaders(origin)
    });
    
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to upload file', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? {
          cloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKey: !!process.env.CLOUDINARY_API_KEY,
          apiSecret: !!process.env.CLOUDINARY_API_SECRET
        } : undefined
      },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
} 