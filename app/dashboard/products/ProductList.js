import React, { useContext, Suspense } from 'react';
import CheckloginContext from '@/app/context/auth/CheckloginContext';
import Link from 'next/link';
import { LuArrowUpRight } from "react-icons/lu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { apiEndpoint } from '@/app/config';
import Cookies from 'js-cookie';

function ProductList({ data }) {
  const { toast } = useToast();
  const Contextdata = useContext(CheckloginContext);

  const DeleteCat = async (catdata) => {
    const token = Cookies.get('token');
    const isConfirmed = window.confirm('Do you want to delete?');

    if (isConfirmed) {
      try {
        const payload = { slug: catdata.slug };
        const response = await axios.post(
          `${apiEndpoint}/admin/delete-product`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status === true) {
          window.location.reload();
          toast({
            variant: 'success',
            title: 'Deleted',
            description: 'Data deleted successfully'
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong'
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <ScrollArea className="h-[calc(80vh-120px)] rounded-md border">
      <div className="w-full overflow-x-auto">
        <Table className="relative min-w-[700px] md:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Short Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Availability</TableHead>

              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <img
                    src={`${item.image}`}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{item.shortDescription}</div>
                </TableCell>
                <TableCell>₹{item.price}</TableCell>
                <TableCell>₹{item.discount}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{item.description}</div>
                </TableCell>
                <TableCell>
                  {item.createdAt.date} {item.createdAt.time}
                </TableCell>

                <TableCell>
                  <Badge variant={item.availability ? 'default' : 'destructive'}>
                    {item.availability ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/products/edit/${item.slug}`}>
                      <Edit className="mr-2 h-4 w-4 cursor-pointer" />
                    </Link>
                    <Trash
                      className="mr-2 h-4 w-4 cursor-pointer"
                      onClick={() => DeleteCat(item)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export default function DataTable(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductList {...props} />
    </Suspense>
  );
}
