import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const [token, setToken] = useState("");
    const [food_list, setFoodlist] = useState([]);

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }

        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { itemId }, {
                    headers: {
                        authorization: `Bearer ${token}` // ✅ FIXED HERE
                    }
                });
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));


        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId }, {
                    headers: {
                        authorization: `Bearer ${token}` 
                    }
                });
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

  
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            setFoodlist(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    const loadCartData = async (userToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, {
                headers: {
                    authorization: `Bearer ${userToken}` 
                }
            });
            setCartItems(response.data.cartData);

            if (response.data.success && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

   
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();

            const localToken = localStorage.getItem("token");
            if (localToken) {
                setToken(localToken);
                await loadCartData(localStorage.getItem("token"));
            }
        }

        loadData();
    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
