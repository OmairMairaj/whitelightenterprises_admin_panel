'use client';
import CheckloginContext from './CheckloginContext';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CheckloginStates = (props) => {
  const [JwtToken, setJwtToken] = useState(null);
  const [UserData, setUserData] = useState(null);
  const [UserLogin, setUserLogin] = useState(false);

  const [AlertData, setAlertData] = useState({
    AlertStatus: false,
    TextMsg: 'This is a Test alert for you!',
    severity: 'warning'
  });

  const ChangeLogin = async (LoginData) => {
    setUserLogin(LoginData.Login);
    setUserData(LoginData.UserData);
  };

  const ChangeAlertData = async (Msg, severity) => {
    const AD = {
      AlertStatus: true,
      TextMsg: Msg,
      severity: severity
    };
    setAlertData(AD);
  };

  const CheckLogin = async () => {
    const token = Cookies.get('token');
    const userDataCookie = Cookies.get('userData');

    if (!token) {
      setUserLogin(false);
      ChangeAlertData('User is not logged in', 'warning');
    } else {
      setJwtToken(token);
      setUserLogin(true);

      const UData = userDataCookie ? JSON.parse(userDataCookie) : null;
      console.log('UData',UData)
      setUserData(UData);
    }
  };

  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      setJwtToken(null);
      setUserData(null);
      setUserLogin(false);
      Cookies.remove('token');
      Cookies.remove('userData');
      window.location.reload();
    }
  };

  useEffect(() => {
    CheckLogin();
  }, []);

  return (
    <CheckloginContext.Provider
      value={{
        UserData,
        UserLogin,
        ChangeAlertData,
        AlertData,
        ChangeLogin,
        JwtToken,
        CheckLogin,
        logout
      }}
    >
      {props.children}
    </CheckloginContext.Provider>
  );
};

export default CheckloginStates;
