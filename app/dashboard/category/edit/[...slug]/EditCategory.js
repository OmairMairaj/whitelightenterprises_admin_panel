'use client';
import React, { useState } from 'react';
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
import axios from 'axios';

const EditCategory = ({catData}) => {
  console.log('catData',catData)
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues = {
    name: catData.title || '',
    description: catData.description || '',
    imgUrl: catData.image || '',
    isActive: catData.isActive || false,
  };

  const form = useForm({ defaultValues });

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) {
      errors.name = 'The Category name must be at least 3 characters long.';
    }
    if (!data.description) {
      errors.description = 'The Category description must be at least 3 characters long.';
    }
    if (!data.imgUrl) {
      errors.imgUrl = 'At least one image must be added.';
    }
    return errors;
  };

  const onSubmit = async (data) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((field) => {
        form.setError(field, { message: errors[field] });
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        catId:catData.catId,
        image: data.imgUrl,
        title: data.name,
        description: data.description,
        isActive: data.isActive === 'true' ? true : false,
      };

      // Get token from cookies
      const token = Cookies.get('token');

     

      const response = await axios.post(
        `${apiEndpoint}/admin/edit-category`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === true) {
        router.refresh();
        router.push(`/dashboard/category`);
        toast({
          variant: 'success',
          title: 'Category Edited successfully!',
          description: 'Your Category has been Edited successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to edit Category!',
          description: `${response.data.msg}`,
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

  const onImageUpload = (Filedata) => {
    if (Filedata && Filedata.postData && Filedata.postData.fileName) {
      form.setValue('imgUrl', Filedata.postData.fileName);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Category name"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="Category description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Status</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loading}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value ? 'true' : 'false'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Public</SelectItem>
                        <SelectItem value="false">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imgUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <Uploadimg  showImg={true}
                    onImageUpload={onImageUpload}
                    Title={'Upload Category Image'}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
           
          </div>
          <Button disabled={loading} className="w-full md:w-auto" type="submit">
           {loading?'please wait':' Update Category'}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EditCategory;
