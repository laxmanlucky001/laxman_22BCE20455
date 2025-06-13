import React, { useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import ProfilePhotoSelector from '../../components/input/ProfilePhotoSelector';
import AuthInput from '../../components/input/AuthInput';
import { validateEmail } from '../../utils/helper';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';

const SignUpForm = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email,setEmail] = useState("");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState(null);

  const navigate =useNavigate();
  const {updateUser} = useContext(UserContext)
  //Handle sign up form submit

  const handleSingUp = async (event) =>{
    event.preventDefault();
    let profileImageUrl=""
    if(!fullName){
      setError("Full name is required");
      return;
    }

    if(!validateEmail(email)){
      setError("Enter a valid email address");
      return;
    }
    if(!username){
      setError("User name is required");
      return;
    }
    if(!password){
      setError("Password is required");
      return;
    }
    setError("");
    //Sign Up API
    try{
      
      //upload image if there
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
        fullName,
        username,
        email,
        password,
        profileImageUrl
      })
      const {token,user} = response.data;
      if(token){
        localStorage.setItem("token",token)
        updateUser(user);
        navigate("/dashboard")
      }
    }catch (err){
      if(error.response && error.response.data.message){
        setError(error.response.data.message)
      }else{
        setError("Something went wrong.Please Try Again Later...")
      }
    }
  }
  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center '>
        <h3 className='text-xl font-semibold text-black'>Create an account</h3>
        <p>Join us today by entering your details now </p>

        <form onSubmit={handleSingUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <AuthInput
            value={fullName}
            onChange={({target})=>setFullName(target.value)}
            label="Full Name"
            placeholder="John Doe"
            type="text"
          />
          <AuthInput 
         value={email}
         onChange={({target}) => setEmail(target.value)}
         label="Email address"
         type="text"
         placeholder="john@example.com"
        />
        <AuthInput
            value={username}
            onChange={({target})=>setUsername(target.value)}
            label="Username"
            placeholder="@"
            type="text"
          />
        <AuthInput 
         value={password}
         onChange={({target}) => setPassword(target.value)}
         label="Password"
         type="password"
         placeholder="Min 8 characters"
        />
        </div>
        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
        <button type="submit" className='btn-primary'>
          CREATE ACCOUNT
        </button>
        <p className='text-[13px] text-slate-800 mt-3'>already have an account{" "}
          <Link to="/login" className='font-medium text-primary underline'>Login</Link>
        </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUpForm