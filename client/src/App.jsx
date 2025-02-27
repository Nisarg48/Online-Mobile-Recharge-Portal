import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/Forgot_Password";
import Profile from "./pages/Profile";
import NetworkProvider from "./pages/NetworkProvider";
import Transaction from "./pages/Transaction";
import Buy_Plan from "./components/Buy_Plan";
import Provider from "./pages/Provider";
import Help from "./pages/Help";
import Terms from "./pages/terms_condition";
import Receipt from "./components/Receipt";


function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/NetworkProvider" element={<NetworkProvider />} />
          <Route path="/NetworkProvider/:provider" element={<Provider />} />
          <Route path="/Transaction" element={<Transaction />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ForgotPassword />} />
        <Route path="/Help" element={<Help />} />
        <Route path="/NetworkProvider/:provider/buy" element={<Buy_Plan />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/Admin" element={<Admin />} />
        
      </Routes>
    </Router>
  );
}

export default App;