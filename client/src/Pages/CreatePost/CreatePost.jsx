
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CreatePost = () => {

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [formData, setFormData] = useState({ text: "", img: "" });

  const imgRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          'Could not upload image (File must be less than 2MB)'
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData((prevFormData) => ({ ...prevFormData, img: downloadURL }));
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  console.log(formData);

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/post/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({ text: "", img: "" });
    setImageFile(null);
    setImageFileUrl(null);
    setImageFileUploadProgress(null);
    setImageFileUploadError(null);
    imgRef.current.value = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost(formData);
  };

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
          placeholder='What is happening?!'
          value={formData.text}
          id='text'
          onChange={handleChange}
        />
        {imageFile && (
          <div className='relative w-72 mx-auto'>
            <IoCloseSharp
              className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={() => {
                setImageFile(null);
                imgRef.current.value = null;
              }}
            />
            <img src={imageFileUrl} className='w-full mx-auto h-72 object-contain rounded' />
          </div>
        )}

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>
          <input type='file' accept="image/*" hidden ref={imgRef} onChange={handleImageChange} />
          <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className='text-red-500'>Something went wrong</div>}
      </form>
    </div>
  );
};
export default CreatePost;
