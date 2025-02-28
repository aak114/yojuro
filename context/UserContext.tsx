"use client"

// /context/UserContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

const supabase = createClient();

const UserContext = createContext<{ user: User | null } | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser(); // Fetch user data once when the component mounts
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
