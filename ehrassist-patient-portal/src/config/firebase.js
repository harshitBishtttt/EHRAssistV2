import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAXlm95hHdbyXo4VJbOWhvY3D_arreyVjo",
  authDomain: "ehrassist-2118c.firebaseapp.com",
  projectId: "ehrassist-2118c",
  storageBucket: "ehrassist-2118c.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
