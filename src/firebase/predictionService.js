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
  // 1차: orderBy 정렬 쿼리 시도
  try {
    const q = query(
      collection(db, PREDICTIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("정렬 쿼리 실패 (인덱스 미생성 가능), 비정렬 조회로 폴백:", err.message);
  }

  // 2차 폴백: orderBy 없이 전체 조회 후 클라이언트 정렬
  try {
    const snap = await getDocs(collection(db, PREDICTIONS_COLLECTION));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 20);
  } catch (err2) {
    console.error("예측 불러오기 최종 실패:", err2);
    throw err2; // 컴포넌트에서 에러 상태로 표시
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
 * 5단계 결과 기준 적중 판정.
 * - success(매수): 강한상승·상승 → 적중
 * - danger(매도):  강한하락·하락 → 적중
 * - neutral(관망): 횡보 → 적중
 * @returns {boolean|null} null = 결과 미입력
 */
export const isPredictionCorrect = (signalType, actualOutcome) => {
  if (!actualOutcome) return null;
  if (signalType === 'success') return actualOutcome === '강한상승' || actualOutcome === '상승';
  if (signalType === 'danger')  return actualOutcome === '강한하락' || actualOutcome === '하락';
  if (signalType === 'neutral') return actualOutcome === '횡보';
  return false;
};

/**
 * 5단계 결과 → 색상 분류
 */
export const outcomeColorClass = (outcome) => {
  if (outcome === '강한상승') return 'strong-pos';
  if (outcome === '상승')     return 'pos';
  if (outcome === '횡보')     return '';
  if (outcome === '하락')     return 'neg';
  if (outcome === '강한하락') return 'strong-neg';
  return '';
};
