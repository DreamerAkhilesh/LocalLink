import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Cart Context for managing shopping cart state
 * Handles cart items, quantities, and cart operations
 */

// Initial cart state
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null
};

// Cart action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product._id === product._id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, { product, quantity }];
      }
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount,
        error: null
      };
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const updatedItems = state.items.filter(item => item.product._id !== productId);
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      }
      
      const updatedItems = state.items.map(item => 
        item.product._id === productId 
          ? { ...item, quantity }
          : item
      );
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      };
    
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case CART_ACTIONS.LOAD_CART:
      const items = action.payload || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items,
        totalItems,
        totalAmount
      };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('locallink_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('locallink_cart', JSON.stringify(state.items));
  }, [state.items]);
  
  // Cart actions
  const addToCart = (product, quantity = 1) => {
    // Check if product has sufficient stock
    if (product.stock < quantity) {
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: `Only ${product.stock} items available in stock` 
      });
      return false;
    }
    
    // Check if adding this quantity would exceed stock
    const existingItem = state.items.find(item => item.product._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: `Cannot add ${quantity} items. Only ${product.stock - currentQuantity} more available` 
      });
      return false;
    }
    
    dispatch({ 
      type: CART_ACTIONS.ADD_ITEM, 
      payload: { product, quantity } 
    });
    return true;
  };
  
  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };
  
  const updateQuantity = (productId, quantity) => {
    const item = state.items.find(item => item.product._id === productId);
    if (item && quantity > item.product.stock) {
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: `Only ${item.product.stock} items available in stock` 
      });
      return false;
    }
    
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { productId, quantity } 
    });
    return true;
  };
  
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };
  
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null });
  };
  
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };
  
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };
  
  // Context value
  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalAmount: state.totalAmount,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    getItemQuantity,
    isInCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;