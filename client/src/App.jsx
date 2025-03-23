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
import Add_Recharge_Plan from "./pages/Add_Recharge_Plan";
import Edit_Recharge_Plan from "./pages/Edit_Recharge_Plan";
import Payment_Details from "./pages/Payment_Details";
import OTP_Verification from "./pages/OTP_Verification";
import User_Management from "./pages/User_Management";
import QueryPage from './pages/Query_Page';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/NetworkProvider" element={<NetworkProvider />} />
          <Route path="/NetworkProvider/:provider" element={<Provider />} />
          <Route path="/Transaction" element={<Transaction />} />
          <Route path="/User_Management" element={<User_Management />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/Help" element={<Help />} />
          <Route path="/query" element={<QueryPage />} />
        </Route>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ForgotPassword />} />
        <Route path="/NetworkProvider/:provider/buy" element={<Buy_Plan />} />
        <Route path="/NetworkProvider/:provider/add_plan" element={<Add_Recharge_Plan />} />
        <Route path="/NetworkProvider/:provider/edit_plan/:planId" element={<Edit_Recharge_Plan />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/payment-details" element={<Payment_Details />} />
        <Route path="/otp-verification" element={<OTP_Verification />} />
      </Routes>
    </Router>
  );
}

export default App;