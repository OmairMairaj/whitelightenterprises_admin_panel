'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Uploadimg from '@/app/Comp/Uploadimg';
import { apiEndpoint } from '@/app/config';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { FaTrash } from 'react-icons/fa'; // Import React Icon for trash
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import CheckloginContext from '@/app/context/auth/CheckloginContext';
import { useDropzone } from 'react-dropzone';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Add PDF upload component
const UploadPDF = ({ onPDFUpload, Title }) => {
  const Contextdata = useContext(CheckloginContext);
  const { toast } = useToast();

  const [errorUploading, setErrorUploading] = useState(false);
  const [errorUploadingMsg, setErrorUploadingMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFilesToCloudinary = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Ensure the file has a proper name and extension
      const fileName = file.name || `pdf_${Date.now()}.pdf`;

      const response = await fetch('/api/upload-attachments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Contextdata.JwtToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.url) {
        console.log("✅ Upload successful:", data);
        const fileData = {
          postData: {
            secure_url: data.url,
            fileName: fileName
          },
          postType: 'application/pdf'
        };
        onPDFUpload(fileData);
        setUploadedFiles([fileData]);
        
        toast({
          title: "Success",
          description: "PDF uploaded successfully"
        });
      } else {
        throw new Error('Upload failed: No URL received');
      }
    } catch (error) {
      console.error('Upload error:', {
        message: error.message,
        error: error
      });
      
      setErrorUploading(true);
      setErrorUploadingMsg(error.message || 'Failed to upload file');
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || 'Failed to upload file'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = async (acceptedFiles) => {
    let file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload a PDF file"
      });
      return;
    }

    await uploadFilesToCloudinary(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded border-2 border-dashed p-4 text-center hover:cursor-pointer transition-colors ${
          errorUploading ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-sm">
          {uploadedFiles.length > 0 ? '✅ PDF Added - Click or drag to replace' : Title}
        </div>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="text-sm text-blue-600">Uploading...</div>
          <Progress value={uploadProgress} className="h-2" />
          <div className="text-xs text-gray-500 text-right">{uploadProgress.toFixed(1)}%</div>
        </div>
      )}
      
      {errorUploading && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {errorUploadingMsg}
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Uploaded: {uploadedFiles[0].postData.fileName}</span>
        </div>
      )}
    </div>
  );
};

const AddProduct = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]); // State to hold additional images
  const Contextdata = useContext(CheckloginContext);

  const defaultValues = {
    name: '',
    price: '',
    discount: '',
    shortDescription: '',
    description: '',
    image: '',
    hoverImage: '',
    availability: true,
    category: '',
    subcategory: '',
    additional_img_cap_1: '',
    additional_img_cap_2: '',
    additional_img_cap_3: '',
    additional_img_cap_4: '',
    additional_img_cap_5: '',
    bannerImage: '',
    pdfFile: '', // Add PDF field
  };

  const form = useForm({ defaultValues });

  // Fetch categories from the API on component mount
  useEffect(() => {
    fetch(`${apiEndpoint}/admin/category-list-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Contextdata.JwtToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          setCategories(data.categories);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, [Contextdata.JwtToken]);

  // Handle category change, fetch corresponding subcategories
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetch(`${apiEndpoint}/admin/sub-category-list-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Contextdata.JwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          setSubcategories(data.subcategories);
        }
      })
      .catch((error) => {
        console.error('Error fetching subcategories:', error);
      });
  };

  // Handle the submission of the form
  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      price: data.price,
      discount: data.discount,
      shortDescription: data.shortDescription,
      description: data.description,
      image: data.image,
      hoverImage: data.hoverImage,
      availability: data.availability,
      category: data.category,
      subcategory: data.subcategory || null,
      additionalImages,  // Include additionalImages in the payload
      additional_img_cap_1: data.additional_img_cap_1,
      additional_img_cap_2: data.additional_img_cap_2,
      additional_img_cap_3: data.additional_img_cap_3,
      additional_img_cap_4: data.additional_img_cap_4,
      additional_img_cap_5: data.additional_img_cap_5,
      bannerImage: data.bannerImage,
      pdfFile: data.pdfFile.url,
    };

    console.log('Submitting with PDF:', data.pdfFile);
    console.log('Payload:', payload); // Log the payload for debugging

    try {
      setLoading(true);

      const response = await fetch(`${apiEndpoint}/admin/add-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Contextdata.JwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === true) {
        router.push(`/dashboard/products`);
        toast({
          variant: 'success',
          title: 'Product created successfully!',
          description: 'Your product has been created successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to create product!',
          description: `${result.msg}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong.',
        description: 'There was an issue with your request.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for additional images
  const handleAdditionalImageUpload = (fileData) => {
    // Add the image as an object with the key "img"
    setAdditionalImages([
      ...additionalImages,
      { img: fileData.postData.secure_url },  // Add new image object to the list
    ]);
  };

  // Handle image deletion
  const handleImageDelete = (index) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1); // Remove the image at the specified index
    setAdditionalImages(newImages);
  };

  // Add this before the return statement
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Category and Subcategory - One line */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category Selection */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCategoryChange(value); // Fetch subcategories
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.catId}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Subcategory Selection (Optional) */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category (Optional)</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loading || !selectedCategory}
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subcategory (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory._id} value={subcategory.subCatId}>
                            {subcategory.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Product Details - One line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Product model number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Product price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Discount percentage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      className="h-[200px] mb-12"
                      placeholder="Description of product"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specifications</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Full Specifications of product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image</FormLabel>
                <Uploadimg
                  showImg={true}
                  onImageUpload={(fileData) => form.setValue('bannerImage', fileData.postData.secure_url)}
                  Title="Upload Banner Image"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <Uploadimg
                  showImg={true}
                  onImageUpload={(fileData) => form.setValue('image', fileData.postData.secure_url)}
                  Title="Upload Product Image"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hoverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hover Image</FormLabel>
                <Uploadimg
                  showImg={true}
                  onImageUpload={(fileData) => form.setValue('hoverImage', fileData.postData.secure_url)}
                  Title="Upload Hover Image"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Images */}
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="additionalImages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Images</FormLabel>
                <Uploadimg
                  onImageUpload={handleAdditionalImageUpload}
                  Title="Upload Additional Images"
                  showImg={false}
                />
                <div className="mt-2">
                  {additionalImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {additionalImages.map((imgObj, index) => (
                        <div key={index} className="w-24 h-24 relative">
                          <img
                            src={`${imgObj.img}`}  // Access the image filename via img key
                            alt={`Additional Image ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleImageDelete(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Image Captions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5].map((index) => (
            <FormField
              key={index}
              control={form.control}
              name={`additional_img_cap_${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption for Additional Image {index}</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder={`Caption for image ${index}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* PDF Upload */}
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Documentation (PDF)</FormLabel>
                <FormControl>
                  <UploadPDF
                    onPDFUpload={(fileData) => {
                      console.log('PDF Upload Data:', fileData);
                      form.setValue('pdfFile', {
                        url: fileData.postData.secure_url,
                        fileName: fileData.postData.fileName,
                        public_id: fileData.postData.public_id
                      });
                    }}
                    Title="Upload Product Documentation (Manual, Specifications, etc.)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Availability */}
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <FormControl>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button disabled={loading} className="w-full md:w-auto" type="submit">
          {loading ? 'Please wait...' : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
};

export default AddProduct;


