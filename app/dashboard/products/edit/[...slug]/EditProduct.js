'use client';
import React, { useState, useEffect } from 'react';
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

const EditProduct = ({ PData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [additionalImages, setAdditionalImages] = useState(PData.additionalImages || []); // Set default images

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
  };

  const form = useForm({ defaultValues });

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
      // When component mounts and there is a selected category (from PData)
      handleCategoryChange(PData.catId);
    }
  }, [PData.catId, token]); // Trigger only when PData.catId changes

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

          // Ensure the form value for subcategory is updated if subCatId exists in PData
          if (PData.subCatId) {
            const matchingSubcategory = data.subcategories.find(
              (subcategory) => subcategory.subCatId === PData.subCatId
            );
            if (matchingSubcategory) {
              // Set the form value for subcategory after fetching
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
      { img: fileData.postData.fileName }, // Add the new image at the beginning
      ...additionalImages, // Spread the existing images after the new one
    ]);
  };

  // Handle image deletion
  const handleImageDelete = (index) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
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
                        handleCategoryChange(value); // Trigger fetching subcategories
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
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Short description of product" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Full description of product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Uploads */}
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
                    onImageUpload={(fileData) => form.setValue('image', fileData.postData.fileName)}
                    Title="Upload Product Image"
                  />

                  <div className='mt-2'>
                    {form.watch('image') && (
                      <img src={`${apiEndpoint}/images/${form.watch('image')}`} alt="Product Image" className="w-24 h-24 object-cover rounded" />
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
                    onImageUpload={(fileData) => form.setValue('hoverImage', fileData.postData.fileName)}
                    Title="Upload Hover Image"
                  />
                  <div className='mt-2'>
                    {form.watch('hoverImage') && (
                      <img src={`${apiEndpoint}/images/${form.watch('hoverImage')}`} alt="Hover Image" className="w-24 h-24 object-cover rounded" />
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
                            src={`${apiEndpoint}/images/${imgObj.img}`} // Display image
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
          {loading ? 'Please wait...' : 'Update Product'}
        </Button>
      </form>
    </Form>
  );
};

export default EditProduct;
