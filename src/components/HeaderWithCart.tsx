import React from 'react';
import { Header } from './Header';
import { useCart } from '../contexts/CartContext';

interface HeaderWithCartProps {
  onCartClick: () => void;
  user?: { name: string; email: string; roles: string[] } | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function HeaderWithCart({ onCartClick, user, onLoginClick, onLogout }: HeaderWithCartProps) {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  return (
    <Header 
      cartCount={cartCount}
      onCartClick={onCartClick}
      user={user}
      onLoginClick={onLoginClick}
      onLogout={onLogout}
    />
  );
}
