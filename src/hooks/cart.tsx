import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketPlace products',
      );
      if (productsStorage) setProducts([...JSON.parse(productsStorage)]);
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
    },
    [products],
  );

  const addToCart = useCallback(
    async (item: Product) => {
      const { id } = item;

      const hasProduct = products.find(product => product.id === id);

      if (hasProduct) {
        await increment(id);
        return;
      }

      const product = { ...item, quantity: 1 };

      await AsyncStorage.setItem(
        '@GoMarketPlace products',
        JSON.stringify(product),
      );

      setProducts([...products, product]);
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
