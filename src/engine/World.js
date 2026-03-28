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
      activeEvent: this.events[this.events.length - 1] || null
    };
  }
}
