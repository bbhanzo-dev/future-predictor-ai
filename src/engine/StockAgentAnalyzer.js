/**
 * StockAgentAnalyzer
 *
 * 종목 선택 시 해당 섹터 담당 에이전트 3명이
 * 뉴스 데이터를 각자의 역할 관점에서 독립 분석하고
 * 컨센서스 신호를 산출합니다.
 */

import {
  STOCK_SECTOR_MAP,
  SECTOR_LABELS,
  SECTOR_LEAD_AGENTS,
  SECTOR_EVENT_WEIGHTS,
} from '../data/StockSectorMap';

// ── 역할별 분석 논평 템플릿 ──────────────────────────────────────────────────
const REASONING_TEMPLATES = {
  macro_economist: {
    buy:     (s) => `거시 지표 호전 신호 포착. 금리 환경과 환율 흐름이 ${s}에 우호적으로 전개되고 있으며 경기 사이클상 매수 타이밍으로 판단됩니다.`,
    sell:    (s) => `거시 리스크 상승 감지. 긴축 기조 지속 및 경기 둔화 신호가 ${s} 실적에 부담으로 작용할 가능성이 높습니다.`,
    neutral: (s) => `거시 지표 혼조. 금리·환율 불확실성이 잔존하여 ${s}에 대한 방향 판단 유보, 추가 데이터 확인이 필요합니다.`,
  },
  technical_analyst: {
    buy:     (s) => `차트 구조 상 긍정 패턴 확인. ${s}의 이동평균 골든크로스 및 거래량 증가로 추세 전환 초기 신호가 감지됩니다.`,
    sell:    (s) => `기술적 데드크로스 근접. ${s} 차트에서 저항선 하향 돌파 시도와 RSI 과매수 신호가 동시에 포착되어 주의가 필요합니다.`,
    neutral: (s) => `${s} 차트가 횡보 박스권 내 등락 중. 명확한 돌파·붕괴 시그널 없이 관망 구간이 지속되고 있습니다.`,
  },
  sentiment_analyst: {
    buy:     (s) => `투자자 심리 개선세. ${s} 관련 긍정 정서 비중이 증가하며 대중의 관심과 기대감이 상향 추세에 있습니다.`,
    sell:    (s) => `군중 심리 냉각 감지. ${s}에 대한 시장 불안 심리가 확산되고 있으며 투매 패턴으로 전환될 가능성을 경고합니다.`,
    neutral: (s) => `${s}에 대한 투자자 심리가 공포와 탐욕 사이에서 혼조. 명확한 심리 전환 신호를 추가 확인 중입니다.`,
  },
  sector_analyst: {
    buy:     (s) => `섹터 로테이션 수혜 포착. ${s}가 속한 업종으로 기관 자금 유입이 감지되며 밸류에이션 매력도 상승 중입니다.`,
    sell:    (s) => `섹터 디스카운트 확대. ${s} 업종 전반에 부정적 이벤트가 축적되고 있으며 기관 매도 흐름이 강화되고 있습니다.`,
    neutral: (s) => `${s} 섹터 방향성 불확실. 업종 내 개별 모멘텀 분산이 심화되어 선택적 대응이 필요한 구간입니다.`,
  },
  risk_manager: {
    buy:     (s) => `리스크 대비 기대 수익 양호. ${s}의 변동성 지표 안정화와 하방 리스크 제한으로 포지션 진입 부담이 낮습니다.`,
    sell:    (s) => `VaR 임계치 근접 경보. ${s}의 하방 리스크가 허용 한도를 초과할 우려가 있으며 포지션 축소를 권고합니다.`,
    neutral: (s) => `${s} 리스크 지표 중립권. 익스포저 유지는 가능하나 추가 확대는 부담, 헤징 검토를 권장합니다.`,
  },
  momentum_trader: {
    buy:     (s) => `강한 상승 모멘텀 확인. ${s}가 52주 고점 돌파 시도 중이며 거래 대금 폭증으로 추세 추종 진입 조건 충족.`,
    sell:    (s) => `모멘텀 급격 소멸. ${s}의 상승 에너지가 고갈되고 있으며 추세 이탈 신호 포착으로 포지션 정리 권고.`,
    neutral: (s) => `${s} 모멘텀 중립. 뚜렷한 추세가 형성되지 않아 신규 포지션 진입보다는 돌파 확인 후 대응이 유리합니다.`,
  },
  global_strategist: {
    buy:     (s) => `글로벌 매크로 우호 환경. 외국인 수급 개선과 달러 인덱스 안정화로 ${s} 수출·해외 실적 개선이 기대됩니다.`,
    sell:    (s) => `지정학·달러 리스크 부각. 달러 강세와 글로벌 공급망 불확실성이 ${s}의 해외 사업에 부담 요인으로 작용합니다.`,
    neutral: (s) => `글로벌 매크로 신호 혼재. 신흥국 자금 흐름 불안정으로 ${s}에 대한 외국인 수급 방향성 판단이 어렵습니다.`,
  },
  quant_analyst: {
    buy:     (s) => `멀티팩터 모델 강세 신호. ${s}의 가치·모멘텀·품질 복합 팩터 점수가 상위 분위에 위치하여 알파 기대치 높음.`,
    sell:    (s) => `퀀트 팩터 악화. ${s}의 이익 모멘텀 하락 및 밸류에이션 고평가 신호가 겹쳐 통계적 하방 확률이 증가합니다.`,
    neutral: (s) => `${s} 팩터 스코어 중립권. 유의미한 알파 신호 없음, 시장 수익률 수준의 성과를 예상합니다.`,
  },
  news_analyst: {
    buy:     (s) => `뉴스 플로우 긍정 우세. ${s} 관련 호재성 기사 집중과 어닝 서프라이즈 기대감이 단기 주가 부양 요인으로 작용 중.`,
    sell:    (s) => `부정 이벤트 연속 발생. ${s}와 관련된 규제 리스크, 실적 쇼크 관련 기사가 증가하며 단기 하방 압력이 높습니다.`,
    neutral: (s) => `${s} 뉴스 방향성 혼조. 긍·부정 기사가 균등하게 배분되어 뉴스 드리븐 모멘텀 판단이 어렵습니다.`,
  },
  portfolio_manager: {
    buy:     (s) => `포트폴리오 편입 적합. ${s}의 리스크 조정 수익률과 상관계수 분석 결과 포트폴리오 분산 효과 및 알파 기여도 양호.`,
    sell:    (s) => `포트폴리오 비중 축소 권고. ${s}의 수익성 악화와 타 자산 대비 기회비용 증가로 비중 조절이 필요합니다.`,
    neutral: (s) => `${s} 비중 현 수준 유지. 당장의 비중 확대·축소보다 관망하며 다음 실적 시즌 결과를 확인하는 것이 적절합니다.`,
  },
};

// ── 핵심 분석 함수 ───────────────────────────────────────────────────────────

/**
 * 뉴스 배열을 섹터 가중치를 반영하여 점수화합니다.
 * @param {Array} newsItems - { impact, type } 형태의 뉴스 아이템
 * @param {string} sectorKey - SECTOR_EVENT_WEIGHTS의 키
 * @returns {number} 가중 평균 impact 점수
 */
function calcSectorScore(newsItems, sectorKey) {
  if (!newsItems || newsItems.length === 0) return 0;
  const weights = SECTOR_EVENT_WEIGHTS[sectorKey] || {};
  let totalScore = 0;
  let totalWeight = 0;
  newsItems.forEach(item => {
    const sectorW = weights[item.type] ?? 1.0;
    totalScore += (item.impact || 0) * sectorW;
    totalWeight += sectorW;
  });
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * 점수와 에이전트 역할에 따라 개별 verdict를 결정합니다.
 * 역할마다 다른 임계값을 적용하여 같은 뉴스에도 판단이 갈립니다.
 */
function calcVerdict(role, baseScore, agentSentiment) {
  // 에이전트의 현재 심리가 분석에 미치는 편향 (±0.015)
  const sentimentBias = (agentSentiment - 0.5) * 0.03;
  const score = baseScore + sentimentBias;

  // 역할별 임계값 (리스크매니저는 보수적, 모멘텀트레이더는 공격적)
  const thresholds = {
    risk_manager:      { buy: 0.10, sell: -0.05 },
    momentum_trader:   { buy: 0.04, sell: -0.08 },
    technical_analyst: { buy: 0.07, sell: -0.07 },
    sentiment_analyst: { buy: 0.06, sell: -0.06 },
    news_analyst:      { buy: 0.05, sell: -0.05 },
    default:           { buy: 0.07, sell: -0.07 },
  };
  const t = thresholds[role] || thresholds.default;

  if (score >= t.buy)   return { verdict: '매수 의견', type: 'success', score };
  if (score <= t.sell)  return { verdict: '매도 의견', type: 'danger',  score };
  return                       { verdict: '관망 의견', type: 'neutral', score };
}

/**
 * 종목 선택 시 섹터 담당 에이전트 3명의 심층 분석을 반환합니다.
 *
 * @param {Agent[]} allAgents - World에서 가져온 전체 에이전트 배열
 * @param {{ code: string, name: string, market: string }} stock - 선택 종목
 * @param {Array} stockNews - fetchStockNews() 결과
 * @returns {{
 *   sector: string,
 *   sectorLabel: string,
 *   agentAnalyses: Array,
 *   consensus: { signal: string, signalType: string, score: number, reason: string }
 * }}
 */
export function analyzeStockByAgents(allAgents, stock, stockNews) {
  const sectorKey = STOCK_SECTOR_MAP[stock.code] || null;
  const sectorLabel = sectorKey ? SECTOR_LABELS[sectorKey] : '기타';
  const leadIds = sectorKey ? SECTOR_LEAD_AGENTS[sectorKey] : [0, 3, 9];

  const baseScore = calcSectorScore(stockNews, sectorKey || 'FINANCE');

  const agentAnalyses = leadIds.map((agentId, idx) => {
    const agent = allAgents[agentId];
    const { verdict, type: verdictType, score } = calcVerdict(
      agent.role,
      baseScore,
      agent.state.sentiment
    );

    const verbKey = verdictType === 'success' ? 'buy'
                  : verdictType === 'danger'  ? 'sell'
                  : 'neutral';

    const template = REASONING_TEMPLATES[agent.role];
    const reasoning = template
      ? template[verbKey](stock.name)
      : `${stock.name}에 대해 분석 중입니다.`;

    return {
      agentId,
      roleLabel: agent.roleLabel,
      role: agent.role,
      confidence: agent.getConfidence(),
      verdict,
      verdictType,
      score,
      reasoning,
      isPrimary: idx === 0, // 첫 번째가 주담당
    };
  });

  // ── 컨센서스 계산 (주담당 2배 가중) ──
  const weights = [2, 1, 1];
  let weightedScore = 0;
  let totalW = 0;
  agentAnalyses.forEach((a, i) => {
    weightedScore += a.score * weights[i];
    totalW += weights[i];
  });
  const consensusScore = weightedScore / totalW;

  const buyVotes  = agentAnalyses.filter(a => a.verdictType === 'success').length;
  const sellVotes = agentAnalyses.filter(a => a.verdictType === 'danger').length;

  let signal, signalType, reason;
  if (consensusScore > 0.065 || buyVotes >= 2) {
    signal = '종합 매수 추천';
    signalType = 'success';
    reason = `담당 에이전트 ${buyVotes}/3명 매수 의견 — 뉴스 가중 점수 +${(consensusScore * 100).toFixed(1)}%`;
  } else if (consensusScore < -0.065 || sellVotes >= 2) {
    signal = '종합 매도 추천';
    signalType = 'danger';
    reason = `담당 에이전트 ${sellVotes}/3명 매도 의견 — 뉴스 가중 점수 ${(consensusScore * 100).toFixed(1)}%`;
  } else {
    signal = '종합 관망 추천';
    signalType = 'neutral';
    reason = `매수 ${buyVotes} / 매도 ${sellVotes} / 관망 ${3 - buyVotes - sellVotes} — 방향성 추가 확인 필요`;
  }

  return {
    sectorKey,
    sectorLabel,
    agentAnalyses,
    consensus: { signal, signalType, score: consensusScore, reason },
  };
}
