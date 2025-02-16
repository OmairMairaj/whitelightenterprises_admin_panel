'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie'; // Importing js-cookie library
import {
  FiBox,
  FiList,
  FiLayers,
} from 'react-icons/fi';
import Link from 'next/link';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { apiEndpoint } from '@/app/config';

const DbCounter = () => {
  const [CounterData, setCounterData] = useState(null);

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const token = Cookies.get('token'); // Get the token from cookies
      
      const response = await axios.post(
        `${apiEndpoint}/admin/db-counter`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add authorization header
          },
        }
      );

      console.log('API Response:', response.data);

      if (response.data.status === true) {
        const { products, categories, subcategories } = response.data;

        // Transform the data into the desired structure
        const transformedData = [
          {
            title: 'Products',
            Count: products,
            Icon: FiBox,
            href: '/dashboard/products',
          },
          {
            title: 'Categories',
            Count: categories,
            Icon: FiList,
            href: '/dashboard/category',
          },
          {
            title: 'Subcategories',
            Count: subcategories,
            Icon: FiLayers,
            href: '/dashboard/category',
          },
        ];

        setCounterData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Show loading skeleton if data is not yet loaded
  if (!CounterData) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full md:w-1/2" />
        <Skeleton className="h-4 w-[90%] md:w-2/5" />
      </div>
    );
  }

  // Render the counter data
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {CounterData.map((item, index) => (
        <Link href={`${item.href}`} key={index}>
          <div className="flex transform items-center space-x-4 rounded-lg border p-6 shadow-md transition-transform hover:scale-105">
            <div className="text-4xl text-blue-500">
              <item.Icon />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-2xl font-bold">{item.Count}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DbCounter;
