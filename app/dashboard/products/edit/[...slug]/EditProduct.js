'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
import { FaTrash } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
});

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

// Add PDF upload component
const UploadPDF = ({ onPDFUpload, Title, initialPDF }) => {
  const { toast } = useToast();
  const token = Cookies.get('token');

  const [errorUploading, setErrorUploading] = useState(false);
  const [errorUploadingMsg, setErrorUploadingMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(initialPDF ? [{
    postData: {
      secure_url: initialPDF,
      fileName: 'Existing PDF'
    },
    postType: 'application/pdf'
  }] : []);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFilesToCloudinary = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const fileName = file.name || `pdf_${Date.now()}.pdf`;

      const response = await fetch('/api/upload-attachments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        onPDFUpload(data.url);
        setUploadedFiles([{
          postData: {
            secure_url: data.url,
            fileName: fileName
          },
          postType: 'application/pdf'
        }]);

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
        className={`rounded border-2 border-dashed p-4 text-center hover:cursor-pointer transition-colors ${errorUploading ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
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
          {uploadedFiles[0].postData.secure_url && (
            <a
              href={uploadedFiles[0].postData.secure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              View PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const EditProduct = ({ PData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [additionalImages, setAdditionalImages] = useState(PData.additionalImages || []);
  const [pdfFile, setPdfFile] = useState(PData.pdfFile || '');

  const defaultValues = {
    name: PData.title || '',
    price: PData.price || '',
    discount: PData.discount || '',
    shortDescription: PData.shortDescription || '',
    description: PData.description || '',
    image: PData.image || '',
    hoverImage: PData.hoverImage || '',
    availability: PData.availability || true,
    category: PData.catId || '',
    subcategory: PData.subCatId || '',
    additional_img_cap_1: PData.additional_img_cap_1 || '',
    additional_img_cap_2: PData.additional_img_cap_2 || '',
    additional_img_cap_3: PData.additional_img_cap_3 || '',
    additional_img_cap_4: PData.additional_img_cap_4 || '',
    additional_img_cap_5: PData.additional_img_cap_5 || '',
    bannerImage: PData.bannerImage || '',
    pdfFile: PData.pdfFile || '',
  };

  const form = useForm({ defaultValues });

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
      ['blockquote'],
      [{ 'script': 'sub' }, { 'script': 'super' }]
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'clean', 'blockquote',
    'script'
  ];

  // Get token from cookies
  const token = Cookies.get('token');

  // Fetch categories from the API on component mount
  useEffect(() => {
    fetch(`${apiEndpoint}/admin/category-list-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

    if (PData.catId) {
      handleCategoryChange(PData.catId);
    }
  }, [PData.catId, token]);

  // Handle category change, fetch corresponding subcategories
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetch(`${apiEndpoint}/admin/sub-category-list-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          setSubcategories(data.subcategories);

          if (PData.subCatId) {
            const matchingSubcategory = data.subcategories.find(
              (subcategory) => subcategory.subCatId === PData.subCatId
            );
            if (matchingSubcategory) {
              form.setValue('subcategory', PData.subCatId);
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching subcategories:', error);
      });
  };

  // Handle the submission of the form
  const onSubmit = async (data) => {
    const payload = {
      slug: PData.slug,
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
      additionalImages,
      additional_img_cap_1: data.additional_img_cap_1,
      additional_img_cap_2: data.additional_img_cap_2,
      additional_img_cap_3: data.additional_img_cap_3,
      additional_img_cap_4: data.additional_img_cap_4,
      additional_img_cap_5: data.additional_img_cap_5,
      bannerImage: data.bannerImage,
      pdfFile: pdfFile,
    };

    try {
      setLoading(true);

      const response = await fetch(`${apiEndpoint}/admin/edit-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === true) {
        router.push(`/dashboard/products`);
        toast({
          variant: 'success',
          title: 'Product updated successfully!',
          description: 'Your product has been updated successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to update product!',
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
    setAdditionalImages([
      { img: fileData.postData.secure_url },
      ...additionalImages,
    ]);
  };

  // Handle image deletion
  const handleImageDelete = (index) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };

  const handlePDFUpload = (pdfUrl) => {
    setPdfFile(pdfUrl);
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
                        handleCategoryChange(value);
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
                  <div className="bg-black">
                    <ReactQuill
                      theme="snow"
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter detailed product description with formatting..."
                      style={{
                        height: '200px',
                        marginBottom: '50px'
                      }}
                      readOnly={loading}
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
                  <Input disabled={loading} placeholder="description of product" {...field} />
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
                <div>
                  <Uploadimg
                    showImg={false}
                    onImageUpload={(fileData) => form.setValue('bannerImage', fileData.postData.secure_url)}
                    Title="Upload Banner Image"
                  />

                  <div className='mt-2'>
                    {form.watch('bannerImage') && (
                      <img src={`${form.watch('bannerImage')}`} alt="Banner Image" className="w-full h-40 object-contain rounded" />
                    )}
                  </div>
                </div>
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
                <div>
                  <Uploadimg
                    showImg={false}
                    onImageUpload={(fileData) => form.setValue('image', fileData.postData.secure_url)}
                    Title="Upload Product Image"
                  />

                  <div className='mt-2'>
                    {form.watch('image') && (
                      <img src={`${form.watch('image')}`} alt="Product Image" className="w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                </div>
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
                <div>
                  <Uploadimg
                    showImg={false}
                    onImageUpload={(fileData) => form.setValue('hoverImage', fileData.postData.secure_url)}
                    Title="Upload Hover Image"
                  />
                  <div className='mt-2'>
                    {form.watch('hoverImage') && (
                      <img src={`${form.watch('hoverImage')}`} alt="Hover Image" className="w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                </div>
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
                            src={`${imgObj.img}`}
                            alt={`Additional Image ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
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

        {/* Caption Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="additional_img_cap_1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for Additional Image 1</FormLabel>
                <Input {...field} placeholder="Enter caption for Additional Image 1" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_img_cap_2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for Additional Image 2</FormLabel>
                <Input {...field} placeholder="Enter caption for Additional Image 2" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_img_cap_3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for Additional Image 3</FormLabel>
                <Input {...field} placeholder="Enter caption for Additional Image 3" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_img_cap_4"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for Additional Image 4</FormLabel>
                <Input {...field} placeholder="Enter caption for Additional Image 4" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additional_img_cap_5"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for Additional Image 5</FormLabel>
                <Input {...field} placeholder="Enter caption for Additional Image 5" />
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

        {/* Add PDF upload section */}
        <FormItem>
          <FormLabel>Product PDF</FormLabel>
          <FormControl>
            <UploadPDF
              onPDFUpload={handlePDFUpload}
              Title="Click or drag and drop to upload PDF"
              initialPDF={PData.pdfFile}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Submit Button */}
        <Button disabled={loading} className="w-full md:w-auto" type="submit">
          {loading ? 'Please wait...' : 'Update Product'}
        </Button>
      </form>
    </Form>
  );
};

export default EditProduct;