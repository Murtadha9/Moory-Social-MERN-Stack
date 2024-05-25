
import React from 'react'
import { Route, Routes ,BrowserRouter, Navigate} from 'react-router-dom';
import SignUp from './Pages/SignUp/SignUp';
import SignIn from './Pages/SignIn/SignIn';
import Home from './Pages/Home/Home';
import Sidebar from './Components/Sidebar/Sidebar';
import RightPanel from './Components/RightPanel/RightPanel';
import NotificationPage from './Pages/NotificationPage/NotificationPage';
import ProfilePage from './Pages/ProfilePage/ProfilePage';
import { Toaster } from 'react-hot-toast';

import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from './Components/LoadingSpinner/LoadingSpinner';

const App = () => {

	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry:false,
	})

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}


  return (
		<div className='flex max-w-6xl mx-auto'>
      <BrowserRouter>
	  {authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser? <Home /> : <Navigate to={'/signin'} />} />
				<Route path='/signup' element={!authUser ? <SignUp /> :<Navigate to={'/'} />}  />
				<Route path='/signin' element={!authUser ? <SignIn /> :<Navigate to={'/'} />} />
				<Route path='/notifications' element={authUser? <NotificationPage />: <Navigate to={'/signin'} />} />
				<Route path='/profile/:username' element={authUser? <ProfilePage/> : <Navigate to={'/signin'} />} /> 
			</Routes>
			{authUser && <RightPanel/>}
			<Toaster/>
      </BrowserRouter>
		</div>
	);
}

export default App
