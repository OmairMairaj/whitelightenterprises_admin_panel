import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file details
    const fileName = file.name || `file_${Date.now()}`;
    const fileNameWithoutExt = fileName.split('.')[0];
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';

    // Determine resource type based on file type
    let resourceType = "raw"; // Default for PDFs and documents
    if (file.type && file.type.startsWith("image/")) {
      resourceType = "image";
    } else if (file.type && file.type.startsWith("video/")) {
      resourceType = "video";
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: 'whitelight_categories',
        resource_type: resourceType,
        public_id: `whitelight_categories/${fileNameWithoutExt}_${Date.now()}`,
        use_filename: true,
        unique_filename: false,
      };

      // Only add format for non-image files
      // Cloudinary handles image format conversion automatically
      if (resourceType === "raw") {
        uploadOptions.format = fileExtension;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
<<<<<<< HEAD
        uploadOptions,
=======
        {
          folder: 'whitelight_categories',
          resource_type: resourceType,
          format: fileExtension,
          public_id: `whitelight_categories/${fileNameWithoutExt}`,
        },
>>>>>>> 5f5fd7e6fc0b687c4bffabb1806d214bd7a20a83
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload failed:', error);
            reject(error);
          } else {
            console.log("✅ Upload successful:", result?.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Return the response in the expected format
    return NextResponse.json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    }, { status: 201 });

  } catch (error) {
    console.error('🚨 Upload Error:', error);
    return NextResponse.json(
      {
        message: 'Failed to upload file',
        error: error.message
      },
      { status: 500 }
    );
  }
}