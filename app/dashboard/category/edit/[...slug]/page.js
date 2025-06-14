"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiEndpoint } from '@/app/config';
import EditCategory from './EditCategory'


import PageContainer from '@/components/layout/page-container';


import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';


export default function Page({ params }) {
    const slug = params.slug[0];
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Get the token from cookies
            const token = Cookies.get('token');

            if (!token) {
                setError('Authorization token not found.');
                return;
            }

            try {

                const payload = { catId: slug };

                // Make the POST request
                const response = await fetch(`${apiEndpoint}/admin/category-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (response.ok && result.status) {
                    setData(result.DataRes);
                } else {
                    setError(result.message || 'Error fetching data.');
                }
            } catch (err) {
                setError('Network error. Please try again.');
            }
        };

        fetchData();
    }, [slug]);

    if (error) {
        return <div><p>Error: {error}</p></div>;
    }

    if (!data) {
        return <div><p>Loading...</p></div>;
    }



    return (
        <>

            <PageContainer scrollable={true}>
                <div className="flex-1 space-y-4 p-2 md:p-8">
                    <div className="flex items-start justify-between">
                        <Heading
                            title={`${data.title}`}
                            description="edit category"
                        />
                    </div>
                    <Separator />

                    <EditCategory catData={data} />
                </div>
            </PageContainer>

        </>
    );
}
