// 시드 데이터 — 백엔드 DB 스키마(ORM)와 1:1 매핑.
// 필드명은 backend/scripts/seed_mock_data.py 의 ORM 컬럼명을 그대로 따른다.
// 데모 환자: 김지원 (명세 7번). 백엔드 시드의 김민준 구조를 따르되 명세에 맞춰 이름만 변경.

import { pseudoHash } from '../lib/hash'

const USER_ID = '11111111-1111-1111-1111-111111111111'

// 결정적 해시 (저장 해시 == 재계산 해시 시연을 위해 콘텐츠 문자열을 기록에 함께 보관)
const recContent = {
  'd4444444-0000-0000-0000-000000000001': 'record:diagnosis:jiwon:hypertension:2026-05-10',
  'd4444444-0000-0000-0000-000000000002': 'record:prescription:jiwon:warfarin:2026-05-10',
  'd4444444-0000-0000-0000-000000000003': 'record:lab_test:jiwon:lipid-panel:2026-03-22',
  'd4444444-0000-0000-0000-000000000004': 'record:checkup:jiwon:annual:2025-11-15',
}

export function buildSeed() {
  const now = Date.now()
  const iso = (msAgo) => new Date(now - msAgo).toISOString()
  const DAY = 86400000

  // --- users (1명) ---
  const users = [
    {
      user_id: USER_ID,
      did: 'did:web:vitalink.io:user:jiwon',
      did_method: 'did:web',
      name: '김지원',
      birth_date: '1971-08-14',
      email: 'jiwon.kim@example.com',
      status: 'active',
    },
  ]

  // --- verifiable_credentials ---
  const verifiable_credentials = [
    {
      vc_id: 'f6666666-0000-0000-0000-000000000001',
      user_id: USER_ID,
      type_code: 'NationalID',
      issuer_id: 'a1111111-0000-0000-0000-000000000003',
      issuer_name: '행정안전부',
      format: 'sd_jwt_vc',
      status: 'valid',
      issued_at: iso(120 * DAY),
      expires_at: iso(-600 * DAY),
    },
    {
      vc_id: 'f6666666-0000-0000-0000-000000000002',
      user_id: USER_ID,
      type_code: 'AdultProof',
      issuer_id: 'a1111111-0000-0000-0000-000000000003',
      issuer_name: '행정안전부',
      format: 'sd_jwt_vc',
      status: 'valid',
      issued_at: iso(120 * DAY),
      expires_at: null,
    },
    {
      vc_id: 'f6666666-0000-0000-0000-000000000003',
      user_id: USER_ID,
      type_code: 'AllergyInfo',
      issuer_id: 'a1111111-0000-0000-0000-000000000001',
      issuer_name: '서울대학교병원',
      format: 'sd_jwt_vc',
      status: 'valid',
      issued_at: iso(40 * DAY),
      expires_at: iso(-325 * DAY),
    },
  ]

  // --- medical_institutions (병원/의원/약국) ---
  const medical_institutions = [
    {
      institution_id: 'c3333333-0000-0000-0000-000000000001',
      name: '서울대학교병원',
      type: 'hospital',
      region: '서울 종로구',
      fhir_endpoint: 'https://fhir.snuh.org/r4',
    },
    {
      institution_id: 'c3333333-0000-0000-0000-000000000002',
      name: '강남세브란스병원',
      type: 'hospital',
      region: '서울 강남구',
      fhir_endpoint: 'https://fhir.gangnam.severance.org/r4',
    },
    {
      institution_id: 'c3333333-0000-0000-0000-000000000003',
      name: '온누리약국',
      type: 'pharmacy',
      region: '서울 강남구',
      fhir_endpoint: 'https://fhir.onnuri.kr/r4',
    },
    {
      institution_id: 'c3333333-0000-0000-0000-000000000004',
      name: '연세이비인후과의원',
      type: 'clinic',
      region: '서울 마포구',
      fhir_endpoint: 'https://fhir.yonsei-ent.kr/r4',
    },
    {
      institution_id: 'c3333333-0000-0000-0000-000000000005',
      name: '국민건강보험공단',
      type: 'public',
      region: '강원 원주시',
      fhir_endpoint: 'https://fhir.nhis.or.kr/r4',
    },
  ]

  // --- chain_configs (explorer_base_url 포함) ---
  const chain_configs = [
    {
      chain_network: 'ethereum_sepolia',
      default_method: 'smart_contract',
      contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      explorer_base_url: 'https://sepolia.etherscan.io',
      is_active: true,
    },
    {
      chain_network: 'polygon_amoy',
      default_method: 'smart_contract',
      contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      explorer_base_url: 'https://amoy.polygonscan.com',
      is_active: false,
    },
  ]

  // --- drugs (충돌 쌍 포함: 와파린 + 아스피린) ---
  const drugs = [
    { drug_code: 'K-647100660', drug_name: '아세트아미노펜정 500mg', atc_class: 'N02BE01', form: '정제' },
    { drug_code: 'K-642700420', drug_name: '아스피린장용정 100mg', atc_class: 'B01AC06', form: '장용정' },
    { drug_code: 'K-650300010', drug_name: '와파린나트륨정 5mg', atc_class: 'B01AA03', form: '정제' },
    { drug_code: 'K-645500120', drug_name: '암로디핀정 5mg', atc_class: 'C08CA01', form: '정제' },
    { drug_code: 'K-648800330', drug_name: '아목시실린캡슐 250mg', atc_class: 'J01CA04', form: '캡슐' },
    { drug_code: 'K-649900540', drug_name: '이부프로펜정 200mg', atc_class: 'M01AE01', form: '정제' },
  ]

  // --- drug_interactions (최소 1쌍 high) ---
  const drug_interactions = [
    {
      drug_code_a: 'K-642700420',
      drug_code_b: 'K-650300010',
      severity: 'high',
      description: '아스피린 + 와파린: 항응고 작용이 중첩되어 출혈 위험이 크게 증가합니다.',
    },
    {
      drug_code_a: 'K-649900540',
      drug_code_b: 'K-650300010',
      severity: 'high',
      description: '이부프로펜 + 와파린: 위장관 출혈 및 항응고 효과 증가 위험.',
    },
    {
      drug_code_a: 'K-648800330',
      drug_code_b: 'K-642700420',
      severity: 'low',
      description: '아목시실린 + 아스피린: 임상적으로 유의한 상호작용은 낮습니다.',
    },
  ]

  // --- medical_records (일부 미연동: institution 연동 시 수집) ---
  // _content 는 데모용(무결성 해시 재계산 원본). _connected=false 면 /connect 에서 수집.
  const medical_records = [
    {
      record_id: 'd4444444-0000-0000-0000-000000000001',
      user_id: USER_ID,
      institution_id: 'c3333333-0000-0000-0000-000000000001',
      category: 'diagnosis',
      fhir_resource_type: 'Condition',
      mongo_resource_id: 'mongo_cond_0001',
      integrity_hash: pseudoHash(recContent['d4444444-0000-0000-0000-000000000001']),
      visit_date: '2026-05-10',
      collected_at: iso(38 * DAY),
      title: '본태성 고혈압 (I10)',
      summary: '수축기 152 / 이완기 96 mmHg. 1기 고혈압 진단.',
      _content: recContent['d4444444-0000-0000-0000-000000000001'],
      _connected: true,
    },
    {
      record_id: 'd4444444-0000-0000-0000-000000000002',
      user_id: USER_ID,
      institution_id: 'c3333333-0000-0000-0000-000000000001',
      category: 'prescription',
      fhir_resource_type: 'MedicationRequest',
      mongo_resource_id: 'mongo_med_0002',
      integrity_hash: pseudoHash(recContent['d4444444-0000-0000-0000-000000000002']),
      visit_date: '2026-05-10',
      collected_at: iso(38 * DAY),
      title: '와파린나트륨정 5mg 처방',
      summary: '1일 1회, 90일분. 항응고 치료 시작.',
      _content: recContent['d4444444-0000-0000-0000-000000000002'],
      _connected: true,
    },
    {
      record_id: 'd4444444-0000-0000-0000-000000000003',
      user_id: USER_ID,
      institution_id: 'c3333333-0000-0000-0000-000000000002',
      category: 'lab_test',
      fhir_resource_type: 'Observation',
      mongo_resource_id: 'mongo_obs_0003',
      integrity_hash: pseudoHash(recContent['d4444444-0000-0000-0000-000000000003']),
      visit_date: '2026-03-22',
      collected_at: iso(20 * DAY),
      title: '지질 패널 검사',
      summary: '총콜레스테롤 224, LDL 148 mg/dL — 경계.',
      _content: recContent['d4444444-0000-0000-0000-000000000003'],
      _connected: true,
    },
    {
      record_id: 'd4444444-0000-0000-0000-000000000004',
      user_id: USER_ID,
      institution_id: 'c3333333-0000-0000-0000-000000000005',
      category: 'checkup',
      fhir_resource_type: 'Observation',
      mongo_resource_id: 'mongo_obs_0004',
      integrity_hash: pseudoHash(recContent['d4444444-0000-0000-0000-000000000004']),
      visit_date: '2025-11-15',
      collected_at: null,
      title: '일반 건강검진 결과',
      summary: 'BMI 26.4, 공복혈당 102 mg/dL. 국가건강검진.',
      _content: recContent['d4444444-0000-0000-0000-000000000004'],
      _connected: false, // 미연동 — /connect 에서 국민건강보험공단 연동 시 수집
    },
  ]

  // --- blockchain_anchors (수집된 기록에 연결) ---
  const blockchain_anchors = [
    {
      anchor_id: 'e5555555-0000-0000-0000-000000000001',
      record_id: 'd4444444-0000-0000-0000-000000000001',
      hash_value: medical_records[0].integrity_hash,
      chain_network: 'ethereum_sepolia',
      tx_hash: '0x' + pseudoHash('tx:rec1'),
      block_number: 4812044,
      status: 'anchored',
      anchored_at: iso(38 * DAY),
    },
    {
      anchor_id: 'e5555555-0000-0000-0000-000000000002',
      record_id: 'd4444444-0000-0000-0000-000000000002',
      hash_value: medical_records[1].integrity_hash,
      chain_network: 'ethereum_sepolia',
      tx_hash: '0x' + pseudoHash('tx:rec2'),
      block_number: 4812045,
      status: 'anchored',
      anchored_at: iso(38 * DAY),
    },
    {
      anchor_id: 'e5555555-0000-0000-0000-000000000003',
      record_id: 'd4444444-0000-0000-0000-000000000003',
      hash_value: medical_records[2].integrity_hash,
      chain_network: 'ethereum_sepolia',
      tx_hash: '0x' + pseudoHash('tx:rec3'),
      block_number: 4831990,
      status: 'anchored',
      anchored_at: iso(20 * DAY),
    },
  ]

  // --- prescriptions (duration_days 로 현재 복용 여부 계산) ---
  const prescriptions = [
    {
      prescription_id: '07777777-0000-0000-0000-000000000001',
      user_id: USER_ID,
      record_id: 'd4444444-0000-0000-0000-000000000002',
      institution_id: 'c3333333-0000-0000-0000-000000000001',
      drug_code: 'K-650300010', // 와파린 — 현재 복용 중 (90일분)
      dosage: '1정 1일 1회',
      duration_days: 90,
      prescribed_date: '2026-05-10',
    },
    {
      prescription_id: '07777777-0000-0000-0000-000000000002',
      user_id: USER_ID,
      record_id: 'd4444444-0000-0000-0000-000000000001',
      institution_id: 'c3333333-0000-0000-0000-000000000001',
      drug_code: 'K-645500120', // 암로디핀 — 현재 복용 중 (혈압약, 90일분)
      dosage: '1정 1일 1회',
      duration_days: 90,
      prescribed_date: '2026-05-10',
    },
    {
      prescription_id: '07777777-0000-0000-0000-000000000003',
      user_id: USER_ID,
      record_id: 'd4444444-0000-0000-0000-000000000003',
      institution_id: 'c3333333-0000-0000-0000-000000000003',
      drug_code: 'K-647100660', // 아세트아미노펜 — 5일분, 이미 종료
      dosage: '1정 1일 3회',
      duration_days: 5,
      prescribed_date: '2026-03-22',
    },
  ]

  // --- emergency_medical_info ---
  const emergency_medical_info = [
    {
      user_id: USER_ID,
      blood_type: 'A+',
      allergies: ['페니실린', '땅콩'],
      chronic_conditions: ['고혈압', '심방세동'],
      emergency_contact: '010-9876-5432 (배우자)',
    },
  ]

  // --- share_consents / access_logs : 초기엔 비어 있음(데모 중 생성) ---
  const share_consents = []
  const access_logs = [
    {
      log_id: '29999999-0000-0000-0000-000000000001',
      user_id: USER_ID,
      accessor_did: 'did:web:snuh.org',
      accessor_type: 'hospital',
      record_id: 'd4444444-0000-0000-0000-000000000001',
      access_type: 'read',
      items: null,
      result: 'success',
      ip_address: '203.0.113.10',
      accessed_at: iso(2 * DAY),
    },
  ]

  // --- emergency_access : 초기엔 비어 있음(er 데모 중 생성) ---
  const emergency_access = []

  return {
    users,
    verifiable_credentials,
    medical_institutions,
    chain_configs,
    drugs,
    drug_interactions,
    medical_records,
    blockchain_anchors,
    prescriptions,
    emergency_medical_info,
    share_consents,
    access_logs,
    emergency_access,
  }
}

export const CURRENT_USER_ID = USER_ID
