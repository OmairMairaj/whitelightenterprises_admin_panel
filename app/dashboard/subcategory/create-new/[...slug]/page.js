import React from 'react';
import PageContainer from '@/components/layout/page-container';

import AddSubCategory from '../AddSubCategory';

import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export default function Page({params}) {
    const slug = params.slug[0];
  return (
    <div>
      <PageContainer scrollable={true}>
        <div className="flex-1 space-y-4 p-2 md:p-8">
          <div className="flex items-start justify-between">
            <Heading
              title={`New Sub Category`}
              description={`create new sub category for ${slug}`}
            />
          </div>
          <Separator />

          <AddSubCategory catId={slug}/>
        </div>
      </PageContainer>
    </div>
  );
}
