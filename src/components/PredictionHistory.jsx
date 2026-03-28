import React, { useState, useEffect } from 'react';
import './PredictionHistory.css';
import {
  savePrediction,
  loadPredictions,
  updateActualResult,
  isPredictionCorrect,
} from '../firebase/predictionService';

/**
 * PredictionHistory
 *
 * 예측 저장 버튼 + 히스토리 패널.
 * 과거 예측 목록에서 실제 결과를 입력하면 적중률을 계산합니다.
 */
const PredictionHistory = ({ currentSummary }) => {
  const [isOpen, setIsOpen]             = useState(false);
  const [predictions, setPredictions]   = useState([]);
  const [isSaving, setIsSaving]         = useState(false);
  const [saveMsg, setSaveMsg]           = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  // 실제 결과 입력 상태 (예측 ID → { outcome, change })
  const [inputMap, setInputMap] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchPredictions = async () => {
    setIsLoading(true);
    const data = await loadPredictions();
    setPredictions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchPredictions();
  }, [isOpen]);

  // ── 예측 저장 ──
  const handleSave = async () => {
    if (!currentSummary) return;
    setIsSaving(true);
    setSaveMsg('');
    const id = await savePrediction(currentSummary);
    if (id) {
      setSaveMsg('저장 완료!');
      if (isOpen) fetchPredictions();
    } else {
      setSaveMsg('저장 실패');
    }
    setIsSaving(false);
    setTimeout(() => setSaveMsg(''), 2500);
  };

  // ── 실제 결과 입력 핸들러 ──
  const handleInputChange = (predId, field, value) => {
    setInputMap(prev => ({
      ...prev,
      [predId]: { ...(prev[predId] || {}), [field]: value },
    }));
  };

  const handleResultSubmit = async (pred) => {
    const input = inputMap[pred.id];
    if (!input?.outcome) return;
    setSavingId(pred.id);
    await updateActualResult(pred.id, {
      outcome: input.outcome,
      change: parseFloat(input.change) || 0,
    });
    await fetchPredictions();
    setInputMap(prev => { const n = { ...prev }; delete n[pred.id]; return n; });
    setSavingId(null);
  };

  // ── 적중률 계산 ──
  const judged = predictions.filter(p => p.actualResult?.outcome);
  const correct = judged.filter(p => isPredictionCorrect(p.signalType, p.actualResult?.outcome));
  const accuracy = judged.length > 0
    ? Math.round((correct.length / judged.length) * 100)
    : null;

  // 시그널 타입 → 한글
  const signalLabel = (type) =>
    type === 'success' ? '매수' : type === 'danger' ? '매도' : '관망';

  return (
    <>
      {/* 트리거 버튼 (항상 화면에 표시) */}
      <div className="pred-trigger-bar">
        <button
          className={`pred-save-btn ${isSaving ? 'saving' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '현재 예측 저장'}
        </button>
        {saveMsg && <span className="pred-save-msg">{saveMsg}</span>}
        <button
          className="pred-history-btn"
          onClick={() => setIsOpen(o => !o)}
        >
          예측 히스토리 {isOpen ? '▲' : '▼'}
          {judged.length > 0 && (
            <span className={`acc-badge ${accuracy >= 60 ? 'good' : accuracy >= 40 ? 'mid' : 'bad'}`}>
              적중률 {accuracy}%
            </span>
          )}
        </button>
      </div>

      {/* 히스토리 패널 */}
      {isOpen && (
        <div className="pred-history-panel">
          <div className="pred-history-header">
            <h3>예측 히스토리</h3>
            <div className="pred-stats">
              <span>총 <b>{predictions.length}</b>건</span>
              <span>결과 입력 <b>{judged.length}</b>건</span>
              {accuracy !== null && (
                <span className={`acc-text ${accuracy >= 60 ? 'good' : accuracy >= 40 ? 'mid' : 'bad'}`}>
                  적중률 <b>{accuracy}%</b> ({correct.length}/{judged.length})
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="pred-loading">불러오는 중...</div>
          ) : predictions.length === 0 ? (
            <div className="pred-loading">저장된 예측이 없습니다.<br />위 버튼으로 현재 예측을 저장하세요.</div>
          ) : (
            <div className="pred-list">
              {predictions.map(pred => {
                const correct = isPredictionCorrect(pred.signalType, pred.actualResult?.outcome);
                const input   = inputMap[pred.id] || {};
                return (
                  <div key={pred.id} className={`pred-card ${pred.signalType}`}>
                    <div className="pred-card-top">
                      <div className="pred-meta">
                        <span className="pred-date">{pred.dateStr}</span>
                        <span className="pred-tick">Tick {pred.tick}</span>
                      </div>
                      {correct !== null && (
                        <span className={`pred-accuracy-badge ${correct ? 'hit' : 'miss'}`}>
                          {correct ? '적중' : '빗나감'}
                        </span>
                      )}
                    </div>

                    <div className="pred-signals">
                      <span className={`pred-signal-pill ${pred.signalType}`}>
                        {signalLabel(pred.signalType)} 신호
                      </span>
                      <span className="pred-scenario">{pred.prediction}</span>
                    </div>

                    <div className="pred-metrics">
                      <span>심리 {(pred.avgSentiment * 100).toFixed(1)}%</span>
                      <span>변동성 {(pred.volatility * 100).toFixed(2)}%</span>
                      <span>모멘텀 {pred.momentum >= 0 ? '▲' : '▼'}{(Math.abs(pred.momentum) * 100).toFixed(2)}%</span>
                    </div>

                    {/* 실제 결과 영역 */}
                    {pred.actualResult ? (
                      <div className="pred-actual">
                        <span className="pred-actual-label">실제 결과:</span>
                        <span className={`pred-actual-outcome ${pred.actualResult.outcome === '상승' ? 'pos' : pred.actualResult.outcome === '하락' ? 'neg' : ''}`}>
                          {pred.actualResult.outcome}
                          {pred.actualResult.change !== 0 && (
                            <> ({pred.actualResult.change > 0 ? '+' : ''}{pred.actualResult.change}%)</>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="pred-result-input">
                        <span className="pred-result-label">실제 결과 입력:</span>
                        <select
                          className="pred-select"
                          value={input.outcome || ''}
                          onChange={e => handleInputChange(pred.id, 'outcome', e.target.value)}
                        >
                          <option value="">결과 선택</option>
                          <option value="상승">상승</option>
                          <option value="하락">하락</option>
                          <option value="횡보">횡보</option>
                        </select>
                        <input
                          className="pred-change-input"
                          type="number"
                          placeholder="등락률 %"
                          step="0.1"
                          value={input.change || ''}
                          onChange={e => handleInputChange(pred.id, 'change', e.target.value)}
                        />
                        <button
                          className="pred-submit-btn"
                          onClick={() => handleResultSubmit(pred)}
                          disabled={!input.outcome || savingId === pred.id}
                        >
                          {savingId === pred.id ? '...' : '저장'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PredictionHistory;
