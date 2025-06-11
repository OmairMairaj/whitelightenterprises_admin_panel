import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    const fileExtension = fileName.split('.').pop() || 'pdf';

    // Determine resource type based on file type
    let resourceType = "raw"; // Default for PDFs and documents
    if (file.type.includes("image")) {
      resourceType = "image";
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'stock_attachments',
          resource_type: resourceType,
          format: fileExtension,
          public_id: `stock_attachments/${fileNameWithoutExt}`,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload failed:', error);
            reject(error);
          } else {
            console.log("✅ Upload successful:", result);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Return the response in the expected format
    return NextResponse.json({
      message: 'Files uploaded successfully',
      urls: [result.secure_url],
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