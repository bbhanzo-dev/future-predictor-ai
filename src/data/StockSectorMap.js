/**
 * Sector definitions and stock-to-sector mapping.
 * Also defines which agents (by ID) are the "lead analysts" for each sector.
 */

export const SECTOR_LABELS = {
  SEMICONDUCTOR: '반도체/IT부품',
  AUTO:          '자동차/모빌리티',
  BATTERY:       '2차전지/에너지',
  BIO:           '바이오/헬스케어',
  FINANCE:       '금융/보험',
  PLATFORM:      '플랫폼/인터넷',
  DEFENSE:       '방산/조선/항공',
  ENERGY:        '에너지/화학',
  ENTERTAINMENT: '엔터/게임',
  STEEL:         '철강/소재',
  RETAIL:        '유통/소비재',
  FOOD:          '식품/생활',
  TELECOM:       '통신',
};

/**
 * stock code → sector key
 */
export const STOCK_SECTOR_MAP = {
  // 반도체/IT부품
  '005930': 'SEMICONDUCTOR', // 삼성전자
  '000660': 'SEMICONDUCTOR', // SK하이닉스
  '011070': 'SEMICONDUCTOR', // LG이노텍
  '009150': 'SEMICONDUCTOR', // 삼성전기
  '403870': 'SEMICONDUCTOR', // HPSP
  '039030': 'SEMICONDUCTOR', // 이오테크닉스
  '240810': 'SEMICONDUCTOR', // 원익IPS
  '357780': 'SEMICONDUCTOR', // 솔브레인
  '058470': 'SEMICONDUCTOR', // 리노공업
  '095340': 'SEMICONDUCTOR', // ISC
  '222800': 'SEMICONDUCTOR', // 심텍
  '000990': 'SEMICONDUCTOR', // DB하이텍
  '440730': 'SEMICONDUCTOR', // 파두
  '089030': 'SEMICONDUCTOR', // 테크윙
  '064760': 'SEMICONDUCTOR', // 티씨케이

  // 자동차/모빌리티
  '005380': 'AUTO', // 현대차
  '000270': 'AUTO', // 기아
  '012330': 'AUTO', // 현대모비스
  '086280': 'AUTO', // 현대글로비스
  '241560': 'AUTO', // 두산밥캣

  // 2차전지/에너지
  '373220': 'BATTERY', // LG에너지솔루션
  '006400': 'BATTERY', // 삼성SDI
  '051910': 'BATTERY', // LG화학
  '247540': 'BATTERY', // 에코프로비엠
  '086520': 'BATTERY', // 에코프로
  '009830': 'BATTERY', // 한화솔루션
  '393890': 'BATTERY', // 더블유씨피
  '137400': 'BATTERY', // 피엔티

  // 바이오/헬스케어
  '207940': 'BIO', // 삼성바이오로직스
  '068270': 'BIO', // 셀트리온
  '091990': 'BIO', // 셀트리온헬스케어
  '028300': 'BIO', // HLB
  '196170': 'BIO', // 알테오젠
  '141080': 'BIO', // 리가켐바이오
  '145020': 'BIO', // 휴젤
  '326030': 'BIO', // SK바이오팜
  '000100': 'BIO', // 유한양행
  '128940': 'BIO', // 한미약품
  '185750': 'BIO', // 종근당
  '006280': 'BIO', // 녹십자
  '069620': 'BIO', // 대웅제약
  '214450': 'BIO', // 파마리서치
  '237690': 'BIO', // 에스티팜
  '064550': 'BIO', // 바이오니아
  '041960': 'BIO', // 코미팜
  '095700': 'BIO', // 제넥신
  '214150': 'BIO', // 클래시스
  '307870': 'BIO', // 아이패스

  // 금융/보험
  '105560': 'FINANCE', // KB금융
  '055550': 'FINANCE', // 신한지주
  '086790': 'FINANCE', // 하나금융지주
  '316140': 'FINANCE', // 우리금융지주
  '032830': 'FINANCE', // 삼성생명
  '000810': 'FINANCE', // 삼성화재
  '377300': 'FINANCE', // 카카오페이
  '323410': 'FINANCE', // 카카오뱅크

  // 플랫폼/인터넷
  '035720': 'PLATFORM', // 카카오
  '035420': 'PLATFORM', // NAVER
  '259960': 'PLATFORM', // 크래프톤

  // 방산/조선/항공
  '329180': 'DEFENSE', // HD현대중공업
  '012450': 'DEFENSE', // 한화에어로스페이스
  '003490': 'DEFENSE', // 대한항공
  '011200': 'DEFENSE', // HMM
  '034020': 'DEFENSE', // 두산에너빌리티
  '180640': 'DEFENSE', // 한진칼

  // 에너지/화학
  '010950': 'ENERGY',  // S-Oil
  '096770': 'ENERGY',  // SK이노베이션
  '015760': 'ENERGY',  // 한국전력
  '011170': 'ENERGY',  // 롯데케미칼
  '047050': 'ENERGY',  // 포스코인터내셔널
  '034730': 'ENERGY',  // SK

  // 엔터/게임
  '352820': 'ENTERTAINMENT', // 하이브
  '036570': 'ENTERTAINMENT', // 엔씨소프트
  '251270': 'ENTERTAINMENT', // 넷마블
  '263750': 'ENTERTAINMENT', // 펄어비스
  '293490': 'ENTERTAINMENT', // 카카오게임즈
  '225570': 'ENTERTAINMENT', // 넥슨게임즈
  '112040': 'ENTERTAINMENT', // 위메이드
  '035900': 'ENTERTAINMENT', // JYP엔터테인먼트
  '041510': 'ENTERTAINMENT', // SM엔터테인먼트
  '122870': 'ENTERTAINMENT', // YG엔터테인먼트

  // 철강/소재
  '005490': 'STEEL', // POSCO홀딩스
  '004020': 'STEEL', // 현대제철
  '010130': 'STEEL', // 고려아연
  '028260': 'STEEL', // 삼성물산

  // 유통/소비재
  '004170': 'RETAIL', // 신세계
  '139480': 'RETAIL', // 이마트
  '282330': 'RETAIL', // BGF리테일

  // 식품/생활
  '271560': 'FOOD', // 오리온
  '097950': 'FOOD', // CJ제일제당
  '280360': 'FOOD', // 롯데웰푸드
  '033780': 'FOOD', // KT&G
  '161890': 'FOOD', // 한국콜마
  '241710': 'FOOD', // 코스메카코리아

  // 통신
  '017670': 'TELECOM', // SK텔레콤
  '030200': 'TELECOM', // KT
  '003550': 'TELECOM', // LG (지주)
  '066570': 'TELECOM', // LG전자
};

/**
 * sector key → lead agent IDs (3명, 순서: 주담당 / 부담당 / 리스크검토)
 *
 * Role ID reference:
 *   0: 거시경제 전문가  1: 기술분석가     2: 심리분석가
 *   3: 섹터분석가       4: 리스크매니저   5: 모멘텀트레이더
 *   6: 글로벌전략가     7: 퀀트분석가     8: 뉴스분석가
 *   9: 포트폴리오매니저
 */
export const SECTOR_LEAD_AGENTS = {
  SEMICONDUCTOR:  [1, 7, 3],  // 기술분석가 · 퀀트분석가 · 섹터분석가
  AUTO:           [0, 3, 6],  // 거시경제 · 섹터분석가 · 글로벌전략가
  BATTERY:        [3, 5, 7],  // 섹터분석가 · 모멘텀트레이더 · 퀀트분석가
  BIO:            [3, 8, 4],  // 섹터분석가 · 뉴스분석가 · 리스크매니저
  FINANCE:        [0, 4, 9],  // 거시경제 · 리스크매니저 · 포트폴리오매니저
  PLATFORM:       [1, 5, 3],  // 기술분석가 · 모멘텀트레이더 · 섹터분석가
  DEFENSE:        [6, 4, 2],  // 글로벌전략가 · 리스크매니저 · 심리분석가
  ENERGY:         [0, 6, 3],  // 거시경제 · 글로벌전략가 · 섹터분석가
  ENTERTAINMENT:  [5, 2, 8],  // 모멘텀트레이더 · 심리분석가 · 뉴스분석가
  STEEL:          [0, 6, 4],  // 거시경제 · 글로벌전략가 · 리스크매니저
  RETAIL:         [2, 9, 3],  // 심리분석가 · 포트폴리오매니저 · 섹터분석가
  FOOD:           [2, 0, 9],  // 심리분석가 · 거시경제 · 포트폴리오매니저
  TELECOM:        [0, 9, 4],  // 거시경제 · 포트폴리오매니저 · 리스크매니저
};

/**
 * sector key → sector-specific event multipliers
 * (applied on top of the agent's own eventWeight)
 */
export const SECTOR_EVENT_WEIGHTS = {
  SEMICONDUCTOR:  { '금융': 1.2, '과학': 1.8, '지정학': 1.4, '사회': 0.5 },
  AUTO:           { '금융': 1.3, '과학': 1.2, '지정학': 1.5, '사회': 0.7 },
  BATTERY:        { '금융': 1.1, '과학': 1.5, '지정학': 1.3, '사회': 0.6 },
  BIO:            { '금융': 1.0, '과학': 1.6, '지정학': 0.8, '사회': 1.3 },
  FINANCE:        { '금융': 1.8, '과학': 0.7, '지정학': 1.4, '사회': 0.9 },
  PLATFORM:       { '금융': 1.2, '과학': 1.5, '지정학': 0.9, '사회': 1.1 },
  DEFENSE:        { '금융': 0.9, '과학': 1.0, '지정학': 2.0, '사회': 0.8 },
  ENERGY:         { '금융': 1.3, '과학': 0.9, '지정학': 1.8, '사회': 0.7 },
  ENTERTAINMENT:  { '금융': 0.8, '과학': 1.0, '지정학': 0.6, '사회': 1.8 },
  STEEL:          { '금융': 1.2, '과학': 0.8, '지정학': 1.6, '사회': 0.7 },
  RETAIL:         { '금융': 1.1, '과학': 0.9, '지정학': 0.7, '사회': 1.5 },
  FOOD:           { '금융': 1.0, '과학': 0.8, '지정학': 0.7, '사회': 1.4 },
  TELECOM:        { '금융': 1.2, '과학': 1.3, '지정학': 1.0, '사회': 1.0 },
};
