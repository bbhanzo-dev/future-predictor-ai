import { Agent, AGENT_ROLE_PRESETS } from './Agent';

export class World {
  constructor(populationSize = 100) {
    this.agents = [];
    this.events = [];
    this.tickCount = 0;
    this.populationSize = populationSize;
    this.history = []; // Store summary history for momentum
    
    this.init();
  }

  init() {
    for (let i = 0; i < this.populationSize; i++) {
      const roleConfig = AGENT_ROLE_PRESETS.find(r => r.id === i) || null;
      if (roleConfig) {
        this.agents.push(new Agent(i, roleConfig.traits, roleConfig));
      } else {
        this.agents.push(new Agent(i));
      }
    }
  }

  addEvent(event) {
    this.events.push(event);
    this.agents.forEach(agent => agent.perceive(event));
  }

  tick() {
    this.tickCount++;

    for (let i = 0; i < this.populationSize / 2; i++) {
      const a1 = this.agents[Math.floor(Math.random() * this.populationSize)];
      const a2 = this.agents[Math.floor(Math.random() * this.populationSize)];
      if (a1 && a2 && a1 !== a2) {
        a1.interact(a2);
      }
    }

    this.agents.forEach(agent => agent.step());

    const summary = this.getSummary();
    this.history.push(summary);
    if (this.history.length > 50) this.history.shift();

    return summary;
  }

  getSummary() {
    const sentiments = this.agents.map(a => a.state.sentiment);
    const avgSentiment = sentiments.reduce((acc, s) => acc + s, 0) / this.populationSize;
    const avgKnowledge = this.agents.reduce((acc, a) => acc + a.state.knowledge, 0) / this.populationSize;
    
    // Calculate Volatility (Standard Deviation of sentiments)
    const variance = sentiments.reduce((acc, s) => acc + Math.pow(s - avgSentiment, 2), 0) / this.populationSize;
    const volatility = Math.sqrt(variance);

    // Calculate Momentum (Change in sentiment over last 5 ticks)
    let momentum = 0;
    if (this.history.length >= 5) {
      momentum = avgSentiment - this.history[this.history.length - 5].avgSentiment;
    }
    
    // Prediction logic
    let currentPrediction = '안정적 성장 및 사회 유지';
    if (avgSentiment < 0.3) currentPrediction = '경제 침체 및 경기 하강 위기';
    else if (avgSentiment > 0.7) currentPrediction = '과도한 열기 및 시장 버블 징후';
    else if (avgKnowledge > 5) currentPrediction = '기술적 도약 및 혁신적 기술 특이점 임박';

    // Investment Signal Logic
    let signal = 'HOLD (관망)';
    let signalRef = 'neutral';
    if (avgSentiment > 0.75) { signal = 'STRONG SELL (과열)'; signalRef = 'danger'; }
    else if (avgSentiment > 0.6) { signal = 'BUY (상승장)'; signalRef = 'success'; }
    else if (avgSentiment < 0.25) { signal = 'STRONG BUY (과매도)'; signalRef = 'success'; }
    else if (avgSentiment < 0.4) { signal = 'SELL (하락 위험)'; signalRef = 'danger'; }

    return {
      tick: this.tickCount,
      avgSentiment,
      avgKnowledge,
      volatility,
      momentum,
      prediction: currentPrediction,
      investmentSignal: {
        text: signal,
        type: signalRef
      },
      scenarios: this.getScenarioPredictions(avgSentiment, avgKnowledge, volatility, momentum),
      activeEvent: this.events[this.events.length - 1] || null
    };
  }

  /**
   * Returns three independent scenario forecasts for different time horizons.
   * Each uses different factors from the simulation state.
   */
  getScenarioPredictions(avgSentiment, avgKnowledge, volatility, momentum) {
    // ── 단기 (1주): 모멘텀 + 현재 심리 ──────────────────────────────────────
    const shortScore = momentum * 3 + (avgSentiment - 0.5) * 0.6;
    const shortUncertain = volatility > 0.15;
    let short;
    if (shortUncertain) {
      short = {
        horizon: '단기 (1주)',
        signal: '변동성 주의',
        signalType: 'neutral',
        scenario: '높은 변동성으로 단기 방향성 불명확. 관망 후 돌파 확인을 권장합니다.',
        probability: Math.round(40 + Math.random() * 15),
        basis: `변동성 ${(volatility * 100).toFixed(1)}% — 임계치 초과`,
      };
    } else if (shortScore > 0.05) {
      const prob = Math.round(55 + Math.min(shortScore * 200, 20));
      short = {
        horizon: '단기 (1주)',
        signal: '단기 상승 우세',
        signalType: 'success',
        scenario: '상승 모멘텀 지속 가능성. 긍정적 뉴스 흐름과 매수세 유입 기대.',
        probability: Math.min(prob, 82),
        basis: `모멘텀 +${(momentum * 100).toFixed(2)}% · 심리 ${(avgSentiment * 100).toFixed(1)}%`,
      };
    } else if (shortScore < -0.05) {
      const prob = Math.round(55 + Math.min(Math.abs(shortScore) * 200, 20));
      short = {
        horizon: '단기 (1주)',
        signal: '단기 하락 경계',
        signalType: 'danger',
        scenario: '하락 모멘텀 지속 위험. 손절 라인 점검 및 포지션 축소 고려.',
        probability: Math.min(prob, 80),
        basis: `모멘텀 ${(momentum * 100).toFixed(2)}% · 심리 ${(avgSentiment * 100).toFixed(1)}%`,
      };
    } else {
      short = {
        horizon: '단기 (1주)',
        signal: '단기 횡보 예상',
        signalType: 'neutral',
        scenario: '뚜렷한 방향성 없이 좁은 박스권 등락 예상. 돌파 시 적극 대응.',
        probability: Math.round(45 + Math.random() * 10),
        basis: `모멘텀 미약 · 심리 ${(avgSentiment * 100).toFixed(1)}%`,
      };
    }

    // ── 중기 (1개월): 최근 20틱 추세 ──────────────────────────────────────
    const recentHistory = this.history.slice(-20);
    const midAvg = recentHistory.length > 0
      ? recentHistory.reduce((s, h) => s + h.avgSentiment, 0) / recentHistory.length
      : avgSentiment;
    const bullTicks = recentHistory.filter(h => h.avgSentiment > 0.55).length;
    const bearTicks = recentHistory.filter(h => h.avgSentiment < 0.45).length;
    let mid;
    if (midAvg > 0.62 && bullTicks > 12) {
      mid = {
        horizon: '중기 (1개월)',
        signal: '중기 강세 지속',
        signalType: 'success',
        scenario: '상승 추세 지속 확률 높음. 기관 자금 유입과 실적 개선 기대 반영.',
        probability: Math.round(58 + Math.min(bullTicks * 1.5, 18)),
        basis: `최근 20틱 평균 심리 ${(midAvg * 100).toFixed(1)}% · 강세 ${bullTicks}틱`,
      };
    } else if (midAvg < 0.38 && bearTicks > 12) {
      mid = {
        horizon: '중기 (1개월)',
        signal: '중기 약세 위험',
        signalType: 'danger',
        scenario: '약세 추세 심화 가능성. 방어적 포지션과 현금 비중 확대를 고려하세요.',
        probability: Math.round(55 + Math.min(bearTicks * 1.5, 18)),
        basis: `최근 20틱 평균 심리 ${(midAvg * 100).toFixed(1)}% · 약세 ${bearTicks}틱`,
      };
    } else {
      mid = {
        horizon: '중기 (1개월)',
        signal: '중기 추세 불명확',
        signalType: 'neutral',
        scenario: '강세·약세 신호 혼조. 중기 방향성을 단정하기 어려운 구간입니다.',
        probability: Math.round(42 + Math.random() * 12),
        basis: `평균 심리 ${(midAvg * 100).toFixed(1)}% · 강세 ${bullTicks} / 약세 ${bearTicks}틱`,
      };
    }

    // ── 장기 (3개월): 평균 회귀 + 지식 축적 ─────────────────────────────
    const knowledgeFactor = Math.min(avgKnowledge / 10, 1); // 0~1
    let longSignal, longSignalType, longScenario, longProb;

    if (avgSentiment > 0.70) {
      // 과열 → 장기 조정 예상
      longSignal    = '장기 조정 가능성';
      longSignalType = 'danger';
      longScenario  = '과열된 시장이 장기적으로 평균 회귀할 가능성이 높습니다. 고점 분할 매도 전략이 유효합니다.';
      longProb      = Math.round(55 + (avgSentiment - 0.70) * 150);
    } else if (avgSentiment < 0.30) {
      // 과매도 → 장기 회복 기대
      longSignal    = '장기 반등 기대';
      longSignalType = 'success';
      longScenario  = '극도로 침체된 시장의 장기 회복 가능성. 분할 매수로 평균 단가를 낮추는 전략을 고려하세요.';
      longProb      = Math.round(55 + (0.30 - avgSentiment) * 150);
    } else if (knowledgeFactor > 0.5) {
      // 지식 축적 → 기술적 성장
      longSignal    = '장기 성장 기대';
      longSignalType = 'success';
      longScenario  = '에이전트 집단 지식 축적이 시장 이해도를 높이며 장기 구조적 성장 시나리오를 뒷받침합니다.';
      longProb      = Math.round(52 + knowledgeFactor * 20);
    } else {
      longSignal    = '장기 안정 성장';
      longSignalType = 'neutral';
      longScenario  = '거시 변수 안정 시 점진적 성장 경로 유지. 급격한 변화보다 완만한 회복이 예상됩니다.';
      longProb      = Math.round(48 + Math.random() * 10);
    }

    const long = {
      horizon: '장기 (3개월)',
      signal: longSignal,
      signalType: longSignalType,
      scenario: longScenario,
      probability: Math.min(longProb, 85),
      basis: `평균회귀 분석 · 지식계수 ${(knowledgeFactor * 100).toFixed(0)}%`,
    };

    return { short, mid, long };
  }
}
