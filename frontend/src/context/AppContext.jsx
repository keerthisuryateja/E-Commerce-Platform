import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';

export const AppContext = createContext();

const DEFAULT_USERS = [
  { id: 1, email: 'admin@ecommerce.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'user@ecommerce.com', password: 'user123', role: 'user' }
];

const DEFAULT_ADDRESSES = [
  { id: 1, user_id: 2, street: '123 Leafy Lane', city: 'Greenwood', state: 'Forest', zip: '98765' }
];

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Fiddle Leaf Fig', description: 'Premium indoor air purifying tree with glossy green leaves.', price: 45.00, stock: 15, image_url: 'assets/fiddle.jpg' },
  { id: 2, name: 'Monstera Deliciosa', description: 'Stunning Swiss cheese plant featuring split heart-shaped leaves.', price: 32.50, stock: 8, image_url: 'assets/Monstera Delociosa.jpg' },
  { id: 3, name: 'Snake Plant', description: 'Extremely resilient succulent ideal for low light and beginners.', price: 19.99, stock: 25, image_url: 'assets/Snake Plant.jpg' },
  { id: 4, name: 'Golden Pothos', description: 'Lush trailing vine with beautiful heart-shaped green and yellow leaves.', price: 14.50, stock: 12, image_url: 'assets/Golden Pothos.jpeg' },
  { id: 5, name: 'Echeveria Succulent', description: 'Beautiful rose-shaped succulent with soft dusty green leaves.', price: 8.99, stock: 40, image_url: 'assets/Echeveria Succulent.jpg' },
  { id: 6, name: 'Boston Fern', description: 'Feathery light green fronds that thrive in humid environments.', price: 22.00, stock: 10, image_url: 'assets/Boston Fern.jpg' }
];

const DEFAULT_ORDERS = [
  {
    id: 1,
    user_id: 2,
    status: 'Pending',
    total_amount: 52.49,
    created_at: new Date().toISOString(),
    items: [
      { id: 1, order_id: 1, product_id: 2, quantity: 1, price: 32.50, name: 'Monstera Deliciosa', image_url: 'assets/Monstera Delociosa.jpg' },
      { id: 2, order_id: 1, product_id: 3, quantity: 1, price: 19.99, name: 'Snake Plant', image_url: 'assets/Snake Plant.jpg' }
    ]
  }
];

const useSimulator = typeof window !== 'undefined' &&
  window.location.hostname.endsWith('github.io') &&
  !(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  // Ref that always mirrors cart — lets WebSocket handler read current cart
  // without being inside a state updater (avoids StrictMode double-fire).
  const cartRef = useRef([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [dbType, setDbType] = useState(useSimulator ? 'In-Memory (Frontend)' : 'MySQL');
  const [wsConnected, setWsConnected] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Recently viewed products (persisted)
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Products loading state
  const [productsLoaded, setProductsLoaded] = useState(false);

  // BASE URLs
  // Prefer explicit Vite env vars (VITE_API_URL / VITE_WS_URL) when provided.
  // Otherwise default to same-origin REST API under `/api` and a matching WebSocket URL.
  // In local development or static hosting (like GitHub Pages on github.io), target local port 5000 directly.
  const isLocalDev = typeof window !== 'undefined' && (
    ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000') ||
    window.location.hostname.endsWith('github.io')
  );

  const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (isLocalDev ? 'http://localhost:5000/api' : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api'));

  const WS_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL)
    ? import.meta.env.VITE_WS_URL
    : (isLocalDev ? 'ws://localhost:5000' : (typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
      : 'ws://localhost:5000'));

  // Deduplication guard — suppresses the same message+type if fired within 300 ms.
  // This covers StrictMode double-invocations and any remaining edge cases.
  const _toastGuard = useRef({});

  const showToast = useCallback((message, type = 'success') => {
    const key = `${type}::${message}`;
    if (_toastGuard.current[key]) return;
    _toastGuard.current[key] = true;
    setTimeout(() => { delete _toastGuard.current[key]; }, 300);

    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      return next;
    });
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const next = [
        { id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock, description: product.description },
        ...filtered
      ].slice(0, 6);
      localStorage.setItem('recentlyViewed', JSON.stringify(next));
      return next;
    });
  }, []);

  // Fetch products catalog
  const fetchProducts = useCallback(async () => {
    if (useSimulator) {
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) {
        localProducts = JSON.stringify(DEFAULT_PRODUCTS);
        localStorage.setItem('sim_products', localProducts);
      }
      setProducts(JSON.parse(localProducts));
      setProductsLoaded(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoaded(true);
    }
  }, []);

  // Fetch shipping addresses
  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    if (useSimulator) {
      let localAddresses = localStorage.getItem('sim_addresses');
      if (!localAddresses) {
        localAddresses = JSON.stringify(DEFAULT_ADDRESSES);
        localStorage.setItem('sim_addresses', localAddresses);
      }
      const allAddresses = JSON.parse(localAddresses);
      setAddresses(allAddresses.filter(a => a.user_id === user?.id));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  }, [token, user]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    if (useSimulator) {
      let localOrders = localStorage.getItem('sim_orders');
      if (!localOrders) {
        localOrders = JSON.stringify(DEFAULT_ORDERS);
        localStorage.setItem('sim_orders', localOrders);
      }
      const allOrders = JSON.parse(localOrders);
      if (user?.role === 'admin') {
        setOrders(allOrders);
      } else {
        setOrders(allOrders.filter(o => o.user_id === user?.id));
      }
      return;
    }
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, [token, user]);

  // Trigger loading data on startup / login change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (token) {
      fetchAddresses();
      fetchOrders();
    } else {
      setAddresses([]);
      setOrders([]);
      setCart([]);
    }
  }, [token, fetchAddresses, fetchOrders]);

  // Real-Time Inventory & State Sync via WebSockets
  useEffect(() => {
    if (useSimulator) {
      setWsConnected(true);
      return;
    }
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      console.log('🔗 Connecting to Live Sync WebSocket...');
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ Live Sync WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'inventory_update') {
            console.log(`⚡ WebSocket inventory_update received for product ${data.productId}: ${data.stock}`);
            
            // 1. Update stock level in products array
            setProducts(prevProducts => 
              prevProducts.map(p => 
                p.id === data.productId ? { ...p, stock: data.stock } : p
              )
            );

            // 2. Alert user if a product in their cart had its stock updated.
            // Read from cartRef (not inside updater) so showToast is called
            // exactly once regardless of StrictMode double-invocation.
            const currentCart = cartRef.current;
            const inCart = currentCart.find(item => item.id === data.productId);
            if (inCart && data.stock < inCart.quantity) {
              showToast(`Stock changed for "${inCart.name}". Cart adjusted to ${data.stock}.`, 'warning');
              if (data.stock === 0) {
                setCart(prev => prev.filter(item => item.id !== data.productId));
              } else {
                setCart(prev => prev.map(item =>
                  item.id === data.productId ? { ...item, quantity: data.stock } : item
                ));
              }
            }
          }

          if (data.type === 'order_update') {
            console.log('⚡ WebSocket order_update received: Refreshing order logs');
            fetchOrders();
          }

        } catch (err) {
          console.error('Error parsing WebSocket data:', err);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected. Retrying in 3 seconds...');
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [fetchOrders, showToast]);

  // Keep cartRef in sync so the WebSocket handler can read current cart
  // without being captured in a stale closure.
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Apply dark mode attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auth Operations
  const login = async (email, password) => {
    if (useSimulator) {
      const matched = DEFAULT_USERS.find(u => u.email === email && u.password === password);
      if (!matched) {
        showToast('Invalid email or password', 'error');
        return false;
      }
      const mockToken = 'mock-jwt-token-for-' + matched.role;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(matched));
      setToken(mockToken);
      setUser(matched);
      showToast('Logged in successfully (Simulated Backend)!', 'success');
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showToast('Logged in successfully!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully. See you again!', 'success');
  };

  // Cart Operations
  const addToCart = (product) => {
    if (!user) {
      showToast('Please login to purchase items.', 'warning');
      return;
    }
    if (product.stock <= 0) {
      showToast('This plant is currently out of stock', 'error');
      return;
    }

    // Read current cart state directly so showToast stays outside the updater.
    // (Calling side-effects inside a setCart updater causes double-fire in StrictMode.)
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast(`Cannot add more. Only ${product.stock} units available in stock.`, 'warning');
        return;
      }
      showToast(`Added another "${product.name}" to cart`);
      setCart(prev => prev.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      showToast(`Added "${product.name}" to cart`);
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, amount) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Compute new quantity from current cart state before calling setCart,
    // keeping showToast outside the updater to avoid StrictMode double-fire.
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== productId));
      return;
    }
    if (newQty > product.stock) {
      showToast(`Only ${product.stock} units available in stock.`, 'warning');
      return;
    }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Removed item from cart');
  };

  // Shipping Address Operations
  const addAddress = async (addressData) => {
    if (useSimulator) {
      let localAddresses = localStorage.getItem('sim_addresses');
      if (!localAddresses) {
        localAddresses = JSON.stringify(DEFAULT_ADDRESSES);
      }
      const allAddresses = JSON.parse(localAddresses);
      const newAddress = {
        id: allAddresses.length + 1,
        user_id: user?.id || 2,
        ...addressData
      };
      allAddresses.push(newAddress);
      localStorage.setItem('sim_addresses', JSON.stringify(allAddresses));
      setAddresses(prev => [...prev, newAddress]);
      showToast('Shipping Address Saved Successfully (Simulated)!', 'success');
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/users/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add address');

      setAddresses(prev => [...prev, data.address]);
      showToast('Shipping Address Saved Successfully', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Checkout Operation (Automated Success)
  const processCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return false;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (useSimulator) {
      // 1. Verify and mutate stock
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      for (const cartItem of cart) {
        const prod = allProducts.find(p => p.id === cartItem.id);
        if (!prod || prod.stock < cartItem.quantity) {
          showToast(`Insufficient stock for ${cartItem.name}`, 'error');
          return false;
        }
      }

      // Decrement stock
      for (const cartItem of cart) {
        const prod = allProducts.find(p => p.id === cartItem.id);
        prod.stock -= cartItem.quantity;
      }
      localStorage.setItem('sim_products', JSON.stringify(allProducts));
      setProducts(allProducts);

      // 2. Create order
      let localOrders = localStorage.getItem('sim_orders');
      if (!localOrders) localOrders = JSON.stringify(DEFAULT_ORDERS);
      const allOrders = JSON.parse(localOrders);

      const newOrder = {
        id: allOrders.length + 1,
        user_id: user?.id || 2,
        status: 'Pending',
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        items: cart.map((item, index) => ({
          id: index + 1,
          order_id: allOrders.length + 1,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image_url: item.image_url
        }))
      };

      allOrders.push(newOrder);
      localStorage.setItem('sim_orders', JSON.stringify(allOrders));
      
      setCart([]);
      showToast('Order Placed Successfully (Simulated)!', 'success');
      fetchOrders();
      return true;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalAmount
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');

      // Order created successfully! Reset Cart
      setCart([]);
      
      // Immediately notify via success toast notification
      showToast('Order Placed Successfully', 'success');
      
      // Refresh local orders list
      fetchOrders();
      return true;

    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Admin inventory updates
  const updateProductStock = async (productId, newStock) => {
    if (useSimulator) {
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      const prod = allProducts.find(p => p.id === productId);
      if (prod) {
        prod.stock = parseInt(newStock);
      }
      localStorage.setItem('sim_products', JSON.stringify(allProducts));
      setProducts(allProducts);
      showToast(`Stock updated to ${newStock} successfully (Simulated)`, 'success');
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update stock');
      
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, stock: parseInt(newStock) } : p)
      );
      showToast(`Stock updated to ${newStock} successfully`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Admin price update
  const updateProductPrice = async (productId, newPrice) => {
    if (useSimulator) {
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      const prod = allProducts.find(p => p.id === productId);
      if (prod) {
        prod.price = parseFloat(newPrice);
      }
      localStorage.setItem('sim_products', JSON.stringify(allProducts));
      setProducts(allProducts);
      showToast(`Price updated to $${parseFloat(newPrice).toFixed(2)} (Simulated)`, 'success');
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/products/${productId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: newPrice })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update price');

      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, price: parseFloat(newPrice) } : p)
      );
      showToast(`Price updated to $${parseFloat(newPrice).toFixed(2)}`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Admin / User cancel order
  const cancelOrder = async (orderId) => {
    if (useSimulator) {
      let localOrders = localStorage.getItem('sim_orders');
      if (!localOrders) localOrders = JSON.stringify(DEFAULT_ORDERS);
      const allOrders = JSON.parse(localOrders);

      const order = allOrders.find(o => o.id === orderId);
      if (!order) {
        showToast('Order not found', 'error');
        return false;
      }

      if (order.status === 'Cancelled') {
        showToast('Order is already cancelled', 'error');
        return false;
      }

      order.status = 'Cancelled';
      localStorage.setItem('sim_orders', JSON.stringify(allOrders));

      // Restock products
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      for (const item of order.items) {
        const prod = allProducts.find(p => p.id === item.product_id);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
      localStorage.setItem('sim_products', JSON.stringify(allProducts));
      setProducts(allProducts);

      showToast('Order Cancelled & Restocked (Simulated)', 'success');
      fetchOrders();
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');

      showToast('Order Cancelled & Restocked', 'success');
      fetchOrders();
      fetchProducts(); // Refresh stock levels locally
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Admin update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (useSimulator) {
      let localOrders = localStorage.getItem('sim_orders');
      if (!localOrders) localOrders = JSON.stringify(DEFAULT_ORDERS);
      const allOrders = JSON.parse(localOrders);

      const order = allOrders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
      }
      localStorage.setItem('sim_orders', JSON.stringify(allOrders));
      showToast(`Order status updated to "${newStatus}" (Simulated)`, 'success');
      fetchOrders();
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order status');

      showToast(`Order status updated to "${newStatus}"`, 'success');
      fetchOrders();
      fetchProducts(); // Refresh stock levels (in case it was Cancelled and restocked)
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    if (!user) {
      showToast('Please login to save favorites.', 'warning');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      let next;
      if (exists) {
        next = prev.filter(item => item.id !== product.id);
        showToast(`Removed "${product.name}" from wishlist`, 'success');
      } else {
        next = [...prev, { id: product.id, name: product.name, addedAt: new Date().toISOString() }];
        showToast(`Added "${product.name}" to wishlist`, 'success');
      }
      localStorage.setItem('wishlist', JSON.stringify(next));
      return next;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Coupon validation
  const COUPONS = [
    { code: 'SPROUT20', discount: 20, type: 'percent', description: '20% off your entire order' },
    { code: 'GREEN10', discount: 10, type: 'percent', description: '10% off your entire order' },
    { code: 'FLAT50', discount: 50, type: 'flat', description: '$50 flat discount' },
    { code: 'FREESHIP', discount: 5.99, type: 'flat', description: 'Free shipping discount' }
  ];

  const validateCoupon = (code) => {
    const coupon = COUPONS.find(c => c.code === code.toUpperCase().trim());
    if (!coupon) {
      showToast('Invalid coupon code. Please try again.', 'error');
      setAppliedCoupon(null);
      return null;
    }
    setAppliedCoupon(coupon);
    showToast(`Coupon "${coupon.code}" applied! ${coupon.description}`, 'success');
    return coupon;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'success');
  };

  // Admin: Add new product
  const addProduct = async (productData) => {
    if (useSimulator) {
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      const newProduct = {
        id: Math.max(0, ...allProducts.map(p => p.id)) + 1,
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        image_url: productData.image_url || '/assets/fiddle.jpg'
      };

      allProducts.push(newProduct);
      localStorage.setItem('sim_products', JSON.stringify(allProducts));
      setProducts(allProducts);
      showToast(`"${newProduct.name}" added to catalog (Simulated)!`, 'success');
      return newProduct;
    }
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');

      setProducts(prev => [...prev, data.product]);
      showToast(`"${data.product.name}" added to catalog!`, 'success');
      return data.product;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Admin: Delete product
  const deleteProduct = async (productId, productName) => {
    if (useSimulator) {
      let localProducts = localStorage.getItem('sim_products');
      if (!localProducts) localProducts = JSON.stringify(DEFAULT_PRODUCTS);
      const allProducts = JSON.parse(localProducts);

      const nextProducts = allProducts.filter(p => p.id !== productId);
      localStorage.setItem('sim_products', JSON.stringify(nextProducts));
      setProducts(nextProducts);
      setCart(prev => prev.filter(item => item.id !== productId));
      showToast(`"${productName}" removed from catalog (Simulated)`, 'success');
      return true;
    }
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');

      setProducts(prev => prev.filter(p => p.id !== productId));
      // Remove from cart if present
      setCart(prev => prev.filter(item => item.id !== productId));
      showToast(`"${productName}" removed from catalog`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      products,
      cart,
      addresses,
      orders,
      toasts,
      wsConnected,
      wishlist,
      appliedCoupon,
      login,
      logout,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      addAddress,
      processCheckout,
      updateProductStock,
      updateProductPrice,
      addProduct,
      deleteProduct,
      cancelOrder,
      updateOrderStatus,
      toggleWishlist,
      isInWishlist,
      validateCoupon,
      removeCoupon,
      showToast,
      API_URL,
      darkMode,
      toggleDarkMode,
      recentlyViewed,
      addToRecentlyViewed,
      productsLoaded,
      useSimulator
    }}>
      {children}
    </AppContext.Provider>
  );
};
