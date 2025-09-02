import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [credit, setCredit] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const loadCreditsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/credits", {
        headers: { token },
      });

      if (data.success) {
        setCredit(data.credits);
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const generateImage = async (prompt) => {
  try {
    const response = await axios.post(
      backendUrl + "/api/image/generate-image",
      { prompt, userId: user?._id }, // ✅ Send userId (required in your backend)
      { headers: { token } }
    );

    const data = response.data;

    if (data.success) {
      loadCreditsData();
      return data.resultImage;
    } else {
      toast.error(data.message || "Something went wrong");
      loadCreditsData();
      if (data.creditBalance === 0 || data.message === "No Credit Balance") {
        navigate("/buy");
      }
      return null;
    }
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    toast.error(msg);

    const creditBalance = error?.response?.data?.creditBalance;
    if (creditBalance === 0 || msg === "No Credit Balance") {
      navigate("/buy");
    }

    return null;
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      loadCreditsData();
    }
  }, [token]);

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    loadCreditsData,
    logout,
    generateImage,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
