/**
 * Prediction History Service
 *
 * Firestore collection: "predictions"
 * Each document represents a snapshot prediction made at a specific tick.
 * Users can later record the actual market outcome for accuracy tracking.
 */

import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, orderBy, limit
} from "firebase/firestore";
import { db } from "./config";

const PREDICTIONS_COLLECTION = "predictions";

/**
 * Save a new prediction snapshot to Firestore.
 * Called when the user clicks "예측 저장" or auto-triggered every N ticks.
 *
 * @param {{
 *   tick: number,
 *   signal: string,
 *   signalType: string,
 *   prediction: string,
 *   avgSentiment: number,
 *   volatility: number,
 *   momentum: number,
 * }} summary - current world summary
 * @returns {string} the new document ID
 */
export const savePrediction = async (summary) => {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

    const ref = await addDoc(collection(db, PREDICTIONS_COLLECTION), {
      tick: summary.tick,
      signal: summary.investmentSignal?.text || summary.signal || '-',
      signalType: summary.investmentSignal?.type || summary.signalType || 'neutral',
      prediction: summary.prediction,
      avgSentiment: summary.avgSentiment,
      volatility: summary.volatility,
      momentum: summary.momentum,
      dateStr,
      createdAt: now.getTime(),
      actualResult: null, // filled in later by the user
    });
    return ref.id;
  } catch (err) {
    console.error("예측 저장 실패:", err);
    return null;
  }
};

/**
 * Load the most recent predictions (up to 20).
 * @returns {Array} sorted by createdAt desc
 */
export const loadPredictions = async () => {
  try {
    const q = query(
      collection(db, PREDICTIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("예측 불러오기 실패:", err);
    return [];
  }
};

/**
 * Record the actual market outcome for a past prediction.
 *
 * @param {string} predictionId - Firestore document ID
 * @param {{ outcome: '상승'|'하락'|'횡보', change: number }} actualResult
 */
export const updateActualResult = async (predictionId, actualResult) => {
  try {
    const ref = doc(db, PREDICTIONS_COLLECTION, predictionId);
    await updateDoc(ref, {
      actualResult: {
        outcome: actualResult.outcome,
        change: actualResult.change,
        recordedAt: Date.now(),
      }
    });
  } catch (err) {
    console.error("실제 결과 저장 실패:", err);
  }
};

/**
 * Determine if a prediction was "correct" given the actual result.
 * - STRONG BUY / BUY  → correct if outcome is '상승'
 * - STRONG SELL / SELL → correct if outcome is '하락'
 * - HOLD / 관망        → correct if outcome is '횡보'
 */
export const isPredictionCorrect = (signalType, actualOutcome) => {
  if (!actualOutcome) return null;
  if (signalType === 'success' && actualOutcome === '상승') return true;
  if (signalType === 'danger'  && actualOutcome === '하락') return true;
  if (signalType === 'neutral' && actualOutcome === '횡보') return true;
  return false;
};
