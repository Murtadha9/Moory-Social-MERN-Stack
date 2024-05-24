
import React from 'react'
import { Route, Routes ,BrowserRouter} from 'react-router-dom';
import SignUp from './Pages/SignUp/SignUp';
import SignIn from './Pages/SignIn/SignIn';
import Home from './Pages/Home/Home';
import Sidebar from './Components/Sidebar/Sidebar';
import RightPanel from './Components/RightPanel/RightPanel';
import NotificationPage from './Pages/NotificationPage/NotificationPage';
import ProfilePage from './Pages/ProfilePage/ProfilePage';

const App = () => {
  return (
		<div className='flex max-w-6xl mx-auto'>
      <BrowserRouter>
	  <Sidebar/>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/signup' element={<SignUp />} />
				<Route path='/signin' element={<SignIn />} />
				<Route path='/notifications' element={<NotificationPage />} />
				<Route path='/profile/:username' element={<ProfilePage/>} /> 
			</Routes>
			<RightPanel/>
      </BrowserRouter>
		</div>
	);
}

export default App
