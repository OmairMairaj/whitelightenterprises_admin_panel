'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

import { useDropzone } from 'react-dropzone';
import CheckloginContext from '@/app/context/auth/CheckloginContext';

import { Progress } from '@/components/ui/progress';
import { apiEndpoint } from '@/app/config';

const UploadFiles = ({ onImageUpload, Title, showImg }) => {
  const Contextdata = useContext(CheckloginContext);

  const [errorUploading, setErrorUploading] = useState(false);
  const [errorUploadingMsg, setErrorUploadingMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [progress, setProgress] = React.useState(0);
  const progressRef = React.useRef(() => { });

  React.useEffect(() => {
    progressRef.current = () => {
      if (progress > 100) {
        setProgress(0);
      } else {
        const diff = Math.random() * 10;
        setProgress(progress + diff);
      }
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const onDrop = async (acceptedFiles) => {
    let fileFormat = acceptedFiles[0].type;

    if (fileFormat.startsWith('image/')) {
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      try {
        const url = `${apiEndpoint}/admin/image-upload`;
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            folderName: 'feedpost',
            Authorization: `Bearer ${Contextdata.UserJwtToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          },
        });

        if (response.data.fileName) {
          const Filedata = {
            postData: response.data,
            postType: fileFormat,
          };
          onImageUpload(Filedata);

          setUploadedFiles([Filedata]);
        } else {
          setErrorUploading(true);
          setErrorUploadingMsg('Something went wrong');
        }
      } catch (error) {
        setErrorUploading(true);
        setErrorUploadingMsg('Error uploading the file');
      }
    } else {
      alert('The selected file format is not supported.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="">
      <div
        {...getRootProps()}
        className="rounded border-2 border-dashed border-gray-300 p-1 text-center hover:cursor-pointer"
      >
        <input {...getInputProps()} />
        <div>{uploadedFiles.length > 0 ? '✅ Image Added' : Title}</div>
      </div>
      {uploadProgress > 0 && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="mb-2" />
          <div className="text-center">{uploadProgress.toFixed(2)}%</div>
        </div>
      )}
      {errorUploading && (
        <div className="mt-4 text-red-500">{errorUploadingMsg}</div>
      )}

      {showImg &&
        <div>
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <img
                src={`${apiEndpoint}/images/${uploadedFiles[0].postData.fileName}`}
                alt={'img'}
               className="w-24 h-24 object-cover rounded"
              />
            </div>
          )}
        </div>
      }


    </div>
  );
};

export default UploadFiles;
