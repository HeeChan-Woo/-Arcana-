import { TarotCard } from '../data/tarotCards';
import type { Reading } from '../context/TarotContext';
import { supabase } from './supabase';

type InterpretationSource = 'fallback' | 'ai';

interface ReadingRow {
  id: string;
  user_id: string;
  question: string;
  cards: TarotCard[];
  interpretation: string;
  interpretation_source: InterpretationSource;
  created_at: string;
}

function toReading(row: ReadingRow): Reading {
  return {
    id: row.id,
    date: row.created_at,
    question: row.question,
    cards: row.cards,
    interpretation: row.interpretation,
    interpretationSource: row.interpretation_source,
  };
}

export async function saveReading(
  userId: string,
  question: string,
  cards: TarotCard[],
  interpretation: string,
  interpretationSource: InterpretationSource = 'fallback',
): Promise<Reading> {
  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id: userId,
      question,
      cards,
      interpretation,
      interpretation_source: interpretationSource,
    })
    .select('id,user_id,question,cards,interpretation,interpretation_source,created_at')
    .single<ReadingRow>();

  if (error) throw error;
  return toReading(data);
}

export async function getReadingsByUserId(userId: string): Promise<Reading[]> {
  const { data, error } = await supabase
    .from('readings')
    .select('id,user_id,question,cards,interpretation,interpretation_source,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<ReadingRow[]>();

  if (error) throw error;
  return (data ?? []).map(toReading);
}

export async function deleteReading(readingId: string): Promise<void> {
  const { error } = await supabase
    .from('readings')
    .delete()
    .eq('id', readingId);

  if (error) throw error;
}

export async function updateReadingInterpretation(
  readingId: string,
  interpretation: string,
  interpretationSource: InterpretationSource,
): Promise<Reading> {
  const { data, error } = await supabase
    .from('readings')
    .update({
      interpretation,
      interpretation_source: interpretationSource,
    })
    .eq('id', readingId)
    .select('id,user_id,question,cards,interpretation,interpretation_source,created_at')
    .single<ReadingRow>();

  if (error) throw error;
  return toReading(data);
}
