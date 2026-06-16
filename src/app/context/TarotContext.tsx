import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { TarotCard } from '../data/tarotCards';
import { createFallbackTarotInterpretation, fetchTarotFromAI } from '../services/tarotAI';
import { supabase } from '../services/supabase';
import {
  deleteReading as deleteReadingFromDb,
  getReadingsByUserId,
  saveReading,
  updateReadingInterpretation,
} from '../services/readingsRepository';

export interface Reading {
  id: string;
  date: string;
  question: string;
  cards: TarotCard[];
  interpretation: string;
  interpretationSource?: 'fallback' | 'ai';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface TarotContextType {
  question: string;
  setQuestion: (q: string) => void;
  selectedCards: TarotCard[];
  setSelectedCards: (cards: TarotCard[]) => void;
  readings: Reading[];
  addReading: (cards: TarotCard[]) => Promise<Reading>;
  reanalyzeReading: (reading: Reading) => Promise<Reading>;
  deleteReading: (id: string) => Promise<void>;
  isLoading: boolean;
  aiError: string | null;
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  totalReadingsToday: number;
  mostPickedCard: TarotCard | null;
}

const TarotContext = createContext<TarotContextType | null>(null);

const LOCAL_READINGS_KEY = 'tarot_readings';

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
}

function readLocalReadings(): Reading[] {
  const saved = localStorage.getItem(LOCAL_READINGS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function writeLocalReadings(readings: Reading[]) {
  localStorage.setItem(LOCAL_READINGS_KEY, JSON.stringify(readings));
}

async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,name,phone')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone ?? undefined,
  };
}

async function upsertProfile(profile: User): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone ?? null,
    })
    .select('id,email,name,phone')
    .single<ProfileRow>();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone ?? undefined,
  };
}

async function resolveUserFromAuth(authUser: SupabaseAuthUser): Promise<User> {
  const profile = await getProfile(authUser.id);
  if (profile) return profile;

  const email = authUser.email ?? '';
  const fallbackProfile: User = {
    id: authUser.id,
    email,
    name: typeof authUser.user_metadata?.name === 'string'
      ? authUser.user_metadata.name
      : email.split('@')[0] || '별빛 여행자',
    phone: typeof authUser.user_metadata?.phone === 'string'
      ? authUser.user_metadata.phone
      : undefined,
  };

  return upsertProfile(fallbackProfile);
}

export function TarotProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const authActionInFlightRef = useRef(false);
  const authSyncInFlightRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const isLoggedIn = user !== null;

  useEffect(() => {
    let isMounted = true;

    async function syncAuthenticatedUser(authUser: SupabaseAuthUser | null) {
      if (!authUser) {
        if (!isMounted) return;
        lastSyncedUserIdRef.current = null;
        setUser(null);
        setReadings(readLocalReadings());
        return;
      }

      if (
        authSyncInFlightRef.current ||
        lastSyncedUserIdRef.current === authUser.id
      ) {
        return;
      }

      authSyncInFlightRef.current = true;

      try {
        const resolvedUser = await resolveUserFromAuth(authUser);
        const userReadings = await getReadingsByUserId(authUser.id);
        if (!isMounted) return;
        lastSyncedUserIdRef.current = authUser.id;
        setUser(resolvedUser);
        setReadings(userReadings);
      } catch (error) {
        console.error('Failed to sync Supabase session.', error);
        if (!isMounted) return;
        lastSyncedUserIdRef.current = null;
        setUser(null);
        setReadings(readLocalReadings());
      } finally {
        authSyncInFlightRef.current = false;
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      void syncAuthenticatedUser(data.session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthenticatedUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const deleteReading = async (id: string) => {
    if (user) {
      await deleteReadingFromDb(id);
      setReadings(prev => prev.filter(reading => reading.id !== id));
      return;
    }

    setReadings(prev => {
      const updated = prev.filter(reading => reading.id !== id);
      writeLocalReadings(updated);
      return updated;
    });
  };

  const addReading = async (cards: TarotCard[]): Promise<Reading> => {
    setIsLoading(true);
    setAiError(null);

    const fallbackReading: Reading = {
      id: `r_${Date.now()}`,
      date: new Date().toISOString(),
      question,
      cards,
      interpretation: createFallbackTarotInterpretation(cards, question),
      interpretationSource: 'fallback',
    };

    const pendingReading = user
      ? await saveReading(user.id, question, cards, fallbackReading.interpretation, 'fallback')
      : fallbackReading;

    setReadings(prev => {
      const updated = [pendingReading, ...prev];
      if (!user) writeLocalReadings(updated);
      return updated;
    });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const interpretation = await fetchTarotFromAI({
        cards,
        question,
        signal: controller.signal,
      });
      const reading: Reading = {
        ...pendingReading,
        question,
        cards,
        interpretation,
        interpretationSource: interpretation === fallbackReading.interpretation ? 'fallback' : 'ai',
      };

      const savedReading = user
        ? await updateReadingInterpretation(reading.id, interpretation, reading.interpretationSource ?? 'fallback')
        : reading;

      setReadings(prev => {
        const updated = prev.map(item => item.id === savedReading.id ? savedReading : item);
        if (!user) writeLocalReadings(updated);
        return updated;
      });

      return savedReading;
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI 해석을 불러오지 못했습니다.');
      return pendingReading;
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const reanalyzeReading = async (reading: Reading): Promise<Reading> => {
    setIsLoading(true);
    setAiError(null);

    const fallbackReading: Reading = {
      ...reading,
      interpretation: reading.interpretation || createFallbackTarotInterpretation(reading.cards, reading.question),
      interpretationSource: reading.interpretationSource || 'fallback',
    };

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const interpretation = await fetchTarotFromAI({
        cards: reading.cards,
        question: reading.question,
        signal: controller.signal,
      });

      const updatedReading: Reading = {
        ...fallbackReading,
        cards: reading.cards,
        interpretation,
        interpretationSource: interpretation === fallbackReading.interpretation ? 'fallback' : 'ai',
      };

      const savedReading = user
        ? await updateReadingInterpretation(reading.id, interpretation, updatedReading.interpretationSource ?? 'fallback')
        : updatedReading;

      setReadings(prev => {
        const updated = prev.map(item => item.id === savedReading.id ? savedReading : item);
        if (!user) writeLocalReadings(updated);
        return updated;
      });

      return savedReading;
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI 해석을 불러오지 못했습니다.');

      setReadings(prev => {
        const updated = prev.map(item => item.id === reading.id ? fallbackReading : item);
        if (!user) writeLocalReadings(updated);
        return updated;
      });

      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (authActionInFlightRef.current) return;
    authActionInFlightRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('로그인 사용자 정보를 찾을 수 없습니다.');

      lastSyncedUserIdRef.current = null;
      const resolvedUser = await resolveUserFromAuth(data.user);
      const userReadings = await getReadingsByUserId(data.user.id);
      lastSyncedUserIdRef.current = data.user.id;
      setUser(resolvedUser);
      setReadings(userReadings);
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string) => {
    if (authActionInFlightRef.current) return;
    authActionInFlightRef.current = true;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('회원가입 사용자 정보를 찾을 수 없습니다.');

      if (!data.session) {
        setUser(null);
        setReadings(readLocalReadings());
        throw new Error('회원가입은 완료됐습니다. 이메일 인증을 완료한 뒤 로그인해주세요.');
      }

      const newUser = await upsertProfile({
        id: data.user.id,
        email,
        name,
        phone,
      });

      lastSyncedUserIdRef.current = data.user.id;
      setUser(newUser);
      setReadings(await getReadingsByUserId(data.user.id));
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const logout = async () => {
    if (authActionInFlightRef.current) return;
    authActionInFlightRef.current = true;

    try {
      await supabase.auth.signOut();
    } finally {
      authActionInFlightRef.current = false;
    }
    lastSyncedUserIdRef.current = null;
    setUser(null);
    setReadings(readLocalReadings());
  };

  const totalReadingsToday = 247 + readings.length;
  const mostPickedCard = readings.length > 0 && readings[0].cards.length > 0
    ? readings[0].cards[0]
    : null;

  return (
    <TarotContext.Provider value={{
      question, setQuestion,
      selectedCards, setSelectedCards,
      readings, addReading, reanalyzeReading, deleteReading,
      isLoading, aiError,
      isLoggedIn, user,
      login, signup, logout,
      totalReadingsToday,
      mostPickedCard,
    }}>
      {children}
    </TarotContext.Provider>
  );
}

export function useTarot() {
  const ctx = useContext(TarotContext);
  if (!ctx) throw new Error('useTarot must be used within TarotProvider');
  return ctx;
}
