import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { HeroBanner } from './components/home/HeroBanner';
import { RoomSizeCalculator } from './components/home/RoomSizeCalculator';
import { BestsellerSlider } from './components/home/BestsellerSlider';
import { FactoryTourSection } from './components/home/FactoryTourSection';
import { DealerNetworkMap } from './components/home/DealerNetworkMap';
import { CustomerReviews } from './components/home/CustomerReviews';
import { FestivalBanner } from './components/home/FestivalBanner';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { DealershipPage } from './components/pages/DealershipPage';
import { BulkEnquiryPage } from './components/pages/BulkEnquiryPage';
import { WarrantyPage } from './components/pages/WarrantyPage';
import { AboutUsPage } from './components/pages/AboutUsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { Product, ProductVariation, CartItem, Order } from './types';
import { coolerAudio } from './utils/coolerSound';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Products State (initialized from INITIAL_PRODUCTS, can be modified via Admin)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('insha_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('insha_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('insha_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'IC-849201',
        customer_name: 'Rajendra Singh Rathore',
        phone: '9829012345',
        email: 'rajendra.rathore@gmail.com',
        delivery_address: 'Plot 14, Tagore Nagar, Ajmer Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006',
        gstin: '',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            variation: INITIAL_PRODUCTS[0].variations[0],
            quantity: 1,
          },
        ],
        total_amount: 9499,
        payment_method: 'cod',
        payment_status: 'pending_delivery',
        order_status: 'dispatched',
        invoice_number: 'INV-2025-0812',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  });

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Cart & Checkout Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Added-to-cart toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist products
  useEffect(() => {
    localStorage.setItem('insha_products', JSON.stringify(products));
  }, [products]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('insha_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist orders
  useEffect(() => {
    localStorage.setItem('insha_orders', JSON.stringify(orders));
  }, [orders]);

  // Handle URL hash changes or browser history
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') setCurrentTab('admin');
      else if (hash === 'shop') setCurrentTab('shop');
      else if (hash === 'calculator') setCurrentTab('calculator');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'admin') window.location.hash = 'admin';
    else if (window.location.hash === '#admin') window.location.hash = '';
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentTab('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    const newState = coolerAudio.toggle();
    setSoundEnabled(newState);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, variation: ProductVariation) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variation.id === variation.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, variation, quantity: 1 }];
    });
    showToast(`Added ${product.name} (${variation.color_name}) to Cart!`);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, variation: ProductVariation) => {
    handleAddToCart(product, variation);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, variationId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, variationId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variation.id === variationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, variationId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variation.id === variationId)
      )
    );
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  // Admin operations
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['order_status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
    );
  };

  // Find currently selected product for PDP
  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#0A3D8F] selection:text-white">
      
      {/* Global Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onSearch={handleSearch}
        isSoundOn={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* TAB: Home */}
        {currentTab === 'home' && (
          <div>
            <HeroBanner
              onExploreShop={() => handleTabChange('shop')}
              onOpenCalculator={() => {
                const el = document.getElementById('room-calculator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleTabChange('calculator');
              }}
              onSelectProduct={handleSelectProduct}
            />

            <BestsellerSlider
              products={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
            />

            <RoomSizeCalculator
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
            />

            <FactoryTourSection
              onOpenDealership={() => handleTabChange('dealership')}
              onOpenBulk={() => handleTabChange('bulk-enquiry')}
            />

            <DealerNetworkMap
              onOpenDealership={() => handleTabChange('dealership')}
            />

            <CustomerReviews />

            <FestivalBanner
              onShopNow={() => handleTabChange('shop')}
            />
          </div>
        )}

        {/* TAB: Shop */}
        {currentTab === 'shop' && (
          <ShopPage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            initialSearchQuery={searchQuery}
          />
        )}

        {/* TAB: Product Detail Page */}
        {currentTab === 'product' && (
          <ProductDetailPage
            product={currentProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => handleTabChange('shop')}
          />
        )}

        {/* TAB: Room Size Calculator (Standalone full page view) */}
        {currentTab === 'calculator' && (
          <div className="py-8">
            <RoomSizeCalculator
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {/* TAB: Factory Tour */}
        {currentTab === 'factory-tour' && (
          <div>
            <FactoryTourSection
              onOpenDealership={() => handleTabChange('dealership')}
              onOpenBulk={() => handleTabChange('bulk-enquiry')}
            />
            <AboutUsPage
              onShopCoolers={() => handleTabChange('shop')}
              onContactUs={() => handleTabChange('dealership')}
            />
          </div>
        )}

        {/* TAB: Dealership */}
        {currentTab === 'dealership' && (
          <DealershipPage />
        )}

        {/* TAB: Bulk Enquiry */}
        {currentTab === 'bulk-enquiry' && (
          <BulkEnquiryPage />
        )}

        {/* TAB: Warranty */}
        {currentTab === 'warranty' && (
          <WarrantyPage />
        )}

        {/* TAB: About Us */}
        {currentTab === 'about' && (
          <AboutUsPage
            onShopCoolers={() => handleTabChange('shop')}
            onContactUs={() => handleTabChange('dealership')}
          />
        )}

        {/* TAB: Admin Dashboard */}
        {currentTab === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal with GST Invoice */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />

      {/* Global Footer */}
      <Footer setCurrentTab={handleTabChange} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
