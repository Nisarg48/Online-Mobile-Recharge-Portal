# Online Mobile Recharge Portal

## Overview
The Online Mobile Recharge Portal is a full-stack web application designed to provide a seamless, secure, and user-friendly platform for mobile recharges. It supports multiple telecom operators (e.g., Jio, Airtel, VI), allowing users to browse plans, recharge mobile numbers, and manage transactions. The project includes an admin panel for managing plans and user accounts, with features like real-time analytics and auto-recharge functionality. This project was developed as part of a B.Tech. Computer Engineering course at Dharmsinh Desai University under the guidance of Prof. Mrudang T. Mehta.

## Features
- **User Features**:
  - Secure registration and login with JWT-based authentication and OTP verification.
  - Select mobile operators and browse/search recharge plans by amount or data.
  - Complete transactions with encrypted payment processing and receive email/SMS confirmations.
  - View transaction history and manage account details.
  - Enable/disable auto-recharge for automatic plan renewals based on wallet balance.
  - Submit feedback and queries via a help center.
- **Admin Features**:
  - Manage recharge plans (add, update, delete) and user accounts (view, suspend, delete).
  - View transaction data and generate reports for recharge trends and user activity.
  - Handle user queries and feedback with a resolution system.
- **Non-Functional**:
  - Responsive UI built with ReactJS for cross-device compatibility.
  - Scalable backend with Node.js, Express.js, and MongoDB, optimized with database indexing.
  - Secure transactions with encrypted data and robust error handling.

## Technologies Used
- **Frontend**: ReactJS, Axios, Tailwind CSS (assumed for styling based on modern web practices)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Postman for API testing
- **Other**: JWT for authentication, HTTP protocol for client-server communication

## Project Structure
- `/client`: ReactJS frontend for user interface and interactions
- `/server`: Node.js and Express.js backend for API endpoints and business logic

## Screenshots
System Architecture
![Picture1](https://github.com/user-attachments/assets/8625a2b2-a54c-4767-a3d2-cdc6305dc149)

1.Login Page

![Picture2](https://github.com/user-attachments/assets/97fdd058-3f49-4212-afd9-d575c69d328a)

2.SignUp Page

![Picture3](https://github.com/user-attachments/assets/ee78f19a-db15-4ff7-96eb-5873d51bba88)

3.Network Provider Page

![Picture4](https://github.com/user-attachments/assets/fda2a1f2-9348-46a9-9827-3529e9fcc645)

4.Transaction History

![Picture5](https://github.com/user-attachments/assets/9c50d6fc-8b9b-4031-ad19-77bdf52f04f2)

5.User Management Page(admin)

![Picture6](https://github.com/user-attachments/assets/45166cc7-1018-467e-b68c-ca7f58447376)

6.Help Center

![Picture7](https://github.com/user-attachments/assets/95693710-08a5-4b57-83f3-23d8bfbec6a3)

7.Query Page

![Picture8](https://github.com/user-attachments/assets/5c904664-05e1-4c42-82cf-b89e2522c68d)

8.User Profile Page

![Picture9](https://github.com/user-attachments/assets/c2f99496-7252-40c0-85ef-bc5a7868275d)

9.Provider Page(admin)

![Picture10](https://github.com/user-attachments/assets/87c854d9-8adf-4520-b282-031a57fba910)

10.Add Recharge Plan Page(admin)

![Picture11](https://github.com/user-attachments/assets/430028fe-6243-49b2-9d8a-77a78e033cb3)

11.Edit Recharge Plan Page(admin)

![Picture12](https://github.com/user-attachments/assets/f799454d-05e6-4374-86f0-1271117b4da3)

12.Plan Information Page

![Picture13](https://github.com/user-attachments/assets/80d8c3f0-1385-4f8f-ae94-e2372f08dfaa)

13.Payment Page

![Picture14](https://github.com/user-attachments/assets/0499f055-9371-4330-ab97-243fab5ffb2b)

14.Payment Recipt

![Picture15](https://github.com/user-attachments/assets/b56a12bb-bb18-4fef-bed9-33aa5909b710)

15.Print Recipt

![Picture16](https://github.com/user-attachments/assets/561d902e-9292-4ca0-a6d0-9d4f1bf30e63)

## Challenges and Learnings
- **Challenges**:
  - Implementing secure JWT-based authentication and OTP verification.
  - Optimizing API calls and database indexing for performance.
  - Ensuring responsive UI across devices.
- **Learnings**:
  - Gained expertise in full-stack development with MERN (MongoDB, Express.js, ReactJS, Node.js).
  - Improved understanding of secure payment processing and real-time transaction handling.
  - Enhanced skills in API testing and debugging with Postman.

## Future Improvements
- Integrate additional payment gateways for broader options.
- Enhance auto-recharge with more customizable scheduling options.
- Analytical Part for Admin

## Contributors
- Nisarg Patel (CE037)
- Chirag Chavda (CE006)

## Acknowledgments
- Prof. Mrudang T. Mehta for guidance and support.
