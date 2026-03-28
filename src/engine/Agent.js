/**
 * Role presets for agents 0-9.
 * Each role has distinct traits, a baseline sentiment to revert to,
 * and event-type weights that reflect their area of expertise.
 */
export const AGENT_ROLE_PRESETS = [
  {
    id: 0,
    role: 'macro_economist',
    label: '거시경제 전문가',
    traits: { riskTolerance: 0.35, socialInfluence: 0.80, curiosity: 0.70, empathy: 0.50, idealism: 0.60 },
    baseline: 0.52,
    eventWeight: { '금융': 1.5, '지정학': 1.2, '과학': 0.8, '사회': 0.6 },
  },
  {
    id: 1,
    role: 'technical_analyst',
    label: '기술분석가',
    traits: { riskTolerance: 0.60, socialInfluence: 0.45, curiosity: 0.90, empathy: 0.25, idealism: 0.35 },
    baseline: 0.48,
    eventWeight: { '금융': 1.3, '지정학': 0.7, '과학': 1.0, '사회': 0.5 },
  },
  {
    id: 2,
    role: 'sentiment_analyst',
    label: '심리분석가',
    traits: { riskTolerance: 0.30, socialInfluence: 0.70, curiosity: 0.80, empathy: 0.90, idealism: 0.70 },
    baseline: 0.45,
    eventWeight: { '금융': 1.0, '지정학': 1.3, '과학': 0.8, '사회': 1.4 },
  },
  {
    id: 3,
    role: 'sector_analyst',
    label: '섹터분석가',
    traits: { riskTolerance: 0.50, socialInfluence: 0.60, curiosity: 0.80, empathy: 0.40, idealism: 0.50 },
    baseline: 0.53,
    eventWeight: { '금융': 1.2, '지정학': 0.9, '과학': 1.2, '사회': 0.8 },
  },
  {
    id: 4,
    role: 'risk_manager',
    label: '리스크매니저',
    traits: { riskTolerance: 0.15, socialInfluence: 0.75, curiosity: 0.55, empathy: 0.50, idealism: 0.25 },
    baseline: 0.35,
    eventWeight: { '금융': 1.4, '지정학': 1.5, '과학': 0.7, '사회': 0.9 },
  },
  {
    id: 5,
    role: 'momentum_trader',
    label: '모멘텀트레이더',
    traits: { riskTolerance: 0.90, socialInfluence: 0.40, curiosity: 0.70, empathy: 0.15, idealism: 0.20 },
    baseline: 0.72,
    eventWeight: { '금융': 1.5, '지정학': 0.6, '과학': 0.9, '사회': 0.5 },
  },
  {
    id: 6,
    role: 'global_strategist',
    label: '글로벌전략가',
    traits: { riskTolerance: 0.50, socialInfluence: 0.90, curiosity: 0.80, empathy: 0.65, idealism: 0.70 },
    baseline: 0.58,
    eventWeight: { '금융': 1.1, '지정학': 1.5, '과학': 1.0, '사회': 1.0 },
  },
  {
    id: 7,
    role: 'quant_analyst',
    label: '퀀트분석가',
    traits: { riskTolerance: 0.65, socialInfluence: 0.25, curiosity: 0.95, empathy: 0.15, idealism: 0.25 },
    baseline: 0.50,
    eventWeight: { '금융': 1.6, '지정학': 0.8, '과학': 1.3, '사회': 0.4 },
  },
  {
    id: 8,
    role: 'news_analyst',
    label: '뉴스분석가',
    traits: { riskTolerance: 0.40, socialInfluence: 0.60, curiosity: 0.95, empathy: 0.60, idealism: 0.55 },
    baseline: 0.50,
    eventWeight: { '금융': 1.0, '지정학': 1.2, '과학': 1.0, '사회': 1.2 },
  },
  {
    id: 9,
    role: 'portfolio_manager',
    label: '포트폴리오매니저',
    traits: { riskTolerance: 0.55, socialInfluence: 0.80, curiosity: 0.70, empathy: 0.60, idealism: 0.50 },
    baseline: 0.56,
    eventWeight: { '금융': 1.3, '지정학': 1.1, '과학': 1.0, '사회': 0.8 },
  },
];

const ROLE_ACTIONS = {
  macro_economist: ['거시경제 지표 분석 중', '금리 동향 모니터링', 'GDP 성장률 추적 중', '물가 지수 점검'],
  technical_analyst: ['차트 패턴 분석 중', '지지/저항선 탐색', '이동평균 크로스오버 체크', 'RSI·MACD 신호 점검'],
  sentiment_analyst: ['시장 심리 분석 중', '투자자 감성 측정', '공포/탐욕 지수 계산', '군중심리 패턴 탐지'],
  sector_analyst: ['섹터 순환 모니터링', '업종별 강도 분석', '밸류에이션 비교 중', '섹터 로테이션 포착'],
  risk_manager: ['리스크 익스포저 점검', '포지션 헤징 검토', '드로우다운 한계 계산', 'VaR 시나리오 시뮬레이션'],
  momentum_trader: ['모멘텀 신호 포착 중', '추세 추종 포지션 구축', '돌파 시그널 대기 중', '고점 갱신 종목 추적'],
  global_strategist: ['글로벌 매크로 탐색', '신흥국 자금 흐름 분석', '지정학 리스크 평가', '달러 인덱스 모니터링'],
  quant_analyst: ['알고리즘 팩터 최적화', '백테스트 시뮬레이션', '통계적 차익거래 탐색', '알파 팩터 발굴 중'],
  news_analyst: ['실시간 뉴스 스캔 중', '이벤트 드리븐 신호 분석', '정보 비대칭 탐색', '서프라이즈 이벤트 추적'],
  portfolio_manager: ['포트폴리오 리밸런싱', '자산배분 최적화 중', '수익률 귀인 분석', '상관관계 분산 점검'],
};

/**
 * Represents an autonomous agent in the simulation.
 */
export class Agent {
  constructor(id, traits = {}, roleConfig = null) {
    this.id = id;

    if (roleConfig) {
      this.role = roleConfig.role;
      this.roleLabel = roleConfig.label;
      this.baselineSentiment = roleConfig.baseline;
      this.eventWeight = roleConfig.eventWeight;
      this.name = roleConfig.label;
    } else {
      this.role = 'general';
      this.roleLabel = null;
      this.baselineSentiment = 0.5;
      this.eventWeight = {};
      this.name = `에이전트 ${id}`;
    }

    // Core Traits (0.0 to 1.0)
    this.traits = {
      riskTolerance: traits.riskTolerance ?? Math.random(),
      socialInfluence: traits.socialInfluence ?? Math.random(),
      curiosity: traits.curiosity ?? Math.random(),
      empathy: traits.empathy ?? Math.random(),
      idealism: traits.idealism ?? Math.random(),
    };

    // State — starts at role's baseline, not a uniform 0.5
    this.state = {
      sentiment: this.baselineSentiment + (Math.random() - 0.5) * 0.1,
      wealth: 1000,
      knowledge: 0,
      lastAction: '관찰 중',
      socialNetwork: [],
    };

    this.memory = [];
  }

  /**
   * Perceive a world event and adjust internal state.
   * Named agents apply role-specific event weights.
   */
  perceive(event) {
    const impact = event.impact || 0;
    const type = event.type;

    // Role-based event sensitivity
    const roleWeight = this.eventWeight[type] ?? 1.0;

    let multiplier = roleWeight;
    if (type === 'financial' || type === '금융') multiplier *= this.traits.riskTolerance;
    if (type === 'geopolitical' || type === '지정학') multiplier *= (1 - this.traits.empathy);

    const delta = impact * multiplier;
    this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment + delta));

    this.memory.push({
      timestamp: Date.now(),
      event: event.title,
      impact: delta,
      reaction: delta > 0 ? '긍정' : '부정',
    });

    if (this.memory.length > 50) this.memory.shift();
  }

  /**
   * Social interaction with another agent.
   */
  interact(other) {
    const influenceDiff = this.traits.socialInfluence - other.traits.socialInfluence;
    const rate = 0.1 + Math.random() * 0.1;

    if (influenceDiff > 0) {
      const shift = (this.state.sentiment - other.state.sentiment) * rate;
      other.state.sentiment = Math.max(0, Math.min(1, other.state.sentiment + shift));
      this.state.lastAction = `${other.name}에게 영향력을 행사함`;
    } else {
      const shift = (other.state.sentiment - this.state.sentiment) * rate;
      this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment + shift));
      this.state.lastAction = `${other.name}의 의견에 동조함`;
    }

    if (Math.random() > 0.95) {
      this.state.knowledge += 1;
    }
  }

  /**
   * Role-specific confidence score (0–99).
   * Each role expresses certainty differently based on market conditions.
   */
  getConfidence() {
    const s = this.state.sentiment;
    const deviation = Math.abs(s - 0.5);

    switch (this.role) {
      case 'risk_manager':
        // Most confident when cautious (low sentiment = high vigilance)
        return Math.round(Math.max(15, Math.min(99, 25 + (1 - s) * 65)));
      case 'momentum_trader':
        // Confidence rises sharply with trend strength (distance from 0.5)
        return Math.round(Math.max(15, Math.min(99, 30 + deviation * 130)));
      case 'sentiment_analyst':
        // Directly tracks crowd emotion
        return Math.round(Math.max(15, Math.min(99, s * 100)));
      case 'quant_analyst':
        // Stable, knowledge-boosted confidence
        return Math.round(Math.max(15, Math.min(99, 50 + this.state.knowledge * 2.5 + deviation * 20)));
      case 'news_analyst': {
        // Spikes after impactful recent news
        const recentHits = this.memory.slice(-5).filter(m => Math.abs(m.impact) > 0.05).length;
        return Math.round(Math.max(15, Math.min(99, 40 + recentHits * 12 + deviation * 45)));
      }
      case 'technical_analyst':
        // Confident in trending markets, low in sideways
        return Math.round(Math.max(15, Math.min(99, 35 + deviation * 110)));
      case 'macro_economist':
        // Broadly confident, slightly conservative
        return Math.round(Math.max(15, Math.min(99, this.baselineSentiment * 80 + (s - this.baselineSentiment) * 40 + 15)));
      case 'global_strategist':
        // High influence → moderate stable confidence
        return Math.round(Math.max(15, Math.min(99, 55 + (s - 0.5) * 50)));
      case 'sector_analyst':
        return Math.round(Math.max(15, Math.min(99, 48 + deviation * 70 + this.state.knowledge)));
      case 'portfolio_manager':
        // Balanced; improves with knowledge and diversification
        return Math.round(Math.max(15, Math.min(99, 52 + this.state.knowledge * 1.5 + (s - 0.5) * 30)));
      default:
        return Math.round(Math.max(15, Math.min(99, s * 100)));
    }
  }

  /**
   * Advance one simulation step.
   */
  step() {
    const meanReversionRate = 0.005;
    // Revert to the role's own baseline, not the global 0.5
    const noise = (Math.random() - 0.5) * 0.02 * this.traits.curiosity;
    this.state.sentiment += (this.baselineSentiment - this.state.sentiment) * meanReversionRate + noise;

    if (this.state.sentiment < 0.1 && Math.random() < this.traits.riskTolerance * 0.1) {
      this.state.sentiment += 0.2;
      this.state.lastAction = '저점 매수 (Contrarian Buy)';
    } else if (this.state.sentiment > 0.9 && Math.random() < this.traits.riskTolerance * 0.1) {
      this.state.sentiment -= 0.2;
      this.state.lastAction = '차익 실현 (Take Profit)';
    } else {
      this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment));

      if (this.state.sentiment < 0.2) {
        this.state.lastAction = '패닉 셀링 / 방어적 자산 보호';
      } else if (this.state.sentiment > 0.8) {
        this.state.lastAction = '적극적 투자 / 자산 확장';
      } else {
        this.state.lastAction = this._getRoleAction();
      }
    }
  }

  _getRoleAction() {
    const actions = ROLE_ACTIONS[this.role] || ['커뮤니티 내 사회적 소통 활동'];
    return actions[Math.floor(Math.random() * actions.length)];
  }
}
