"""VitaLink(의료지갑) MVP 목업 데이터 시드 스크립트.

19개 ERD 테이블 전부에 FK 순서를 지켜 일관된 목업 데이터를 삽입한다.
``session.merge()`` 로 PK 기준 upsert 하므로 여러 번 실행해도 안전(멱등)하다.

사용:
    cd MedicalWallet
    python scripts/seed_mock_data.py

전제: .env 의 DATABASE_URL 이 설정되어 있어야 한다.
"""

from __future__ import annotations

import asyncio
import hashlib
import sys
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

# PYTHONPATH: 프로젝트 루트 + apps
_root = Path(__file__).resolve().parent.parent
for _p in (_root, _root / "apps"):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from dotenv import load_dotenv

load_dotenv(_root / ".env")

from core.database import async_session_maker, ensure_tables, init_engine  # noqa: E402

# identity
from identity.adapter.outbound.orm.credential_type_def_orm import CredentialTypeDefORM
from identity.adapter.outbound.orm.partner_orm import PartnerORM
from identity.adapter.outbound.orm.subscription_orm import SubscriptionORM
from identity.adapter.outbound.orm.trusted_issuer_orm import TrustedIssuerORM
from identity.adapter.outbound.orm.user_orm import UserORM
from identity.adapter.outbound.orm.verifiable_credential_orm import VerifiableCredentialORM

# medical_record
from medical_record.adapter.outbound.orm.access_log_orm import AccessLogORM
from medical_record.adapter.outbound.orm.blockchain_anchor_orm import BlockchainAnchorORM
from medical_record.adapter.outbound.orm.chain_config_orm import ChainConfigORM
from medical_record.adapter.outbound.orm.drug_interaction_orm import DrugInteractionORM
from medical_record.adapter.outbound.orm.drug_orm import DrugORM
from medical_record.adapter.outbound.orm.emergency_access_orm import EmergencyAccessORM
from medical_record.adapter.outbound.orm.emergency_medical_info_orm import EmergencyMedicalInfoORM
from medical_record.adapter.outbound.orm.insurance_claim_orm import InsuranceClaimORM
from medical_record.adapter.outbound.orm.insurance_claim_record_orm import InsuranceClaimRecordORM
from medical_record.adapter.outbound.orm.medical_institution_orm import MedicalInstitutionORM
from medical_record.adapter.outbound.orm.medical_record_orm import MedicalRecordORM
from medical_record.adapter.outbound.orm.prescription_orm import PrescriptionORM

# share_token
from share_token.adapter.outbound.orm.share_consent_orm import ShareConsentORM

NOW = datetime.now(timezone.utc)


def enc(text: str) -> bytes:
    """이름/전화 암호화 컬럼용 목업 바이트 (실제 암호화 아님)."""
    return f"ENC:{text}".encode("utf-8")


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def build_rows() -> list:
    """삽입 순서(FK 의존성)대로 ORM 인스턴스 목록을 만든다."""

    # --- 마스터/독립 테이블 ---
    users = [
        UserORM(
            user_id="11111111-1111-1111-1111-111111111111",
            did="did:web:vitalink.io:user:minjun",
            did_method="did:web",
            name_enc=enc("김민준"),
            birth_date=date(1985, 3, 12),
            phone_enc=enc("010-1234-5678"),
            email="minjun.kim@example.com",
            status="active",
        ),
        UserORM(
            user_id="22222222-2222-2222-2222-222222222222",
            did="did:web:vitalink.io:user:seoyeon",
            did_method="did:web",
            name_enc=enc("이서연"),
            birth_date=date(2012, 7, 25),
            phone_enc=None,
            email="seoyeon.lee@example.com",
            status="active",
        ),
        UserORM(
            user_id="33333333-3333-3333-3333-333333333333",
            did="did:ethr:0xJiho",
            did_method="did:ethr",
            name_enc=enc("박지호"),
            birth_date=date(1978, 11, 2),
            phone_enc=enc("010-9876-5432"),
            email="jiho.park@example.com",
            status="active",
        ),
    ]

    credential_type_defs = [
        CredentialTypeDefORM(
            type_code="FamilyHealthDelegation",
            context_url="https://vitalink.io/contexts/family-health-delegation/v1",
            description="가족 간 건강관리 권한 위임 자격증명",
        ),
        CredentialTypeDefORM(
            type_code="VaccinationCertificate",
            context_url="https://vitalink.io/contexts/vaccination/v1",
            description="예방접종 증명",
        ),
        CredentialTypeDefORM(
            type_code="DiagnosisCredential",
            context_url="https://vitalink.io/contexts/diagnosis/v1",
            description="진단 자격증명",
        ),
    ]

    trusted_issuers = [
        TrustedIssuerORM(
            issuer_id="a1111111-0000-0000-0000-000000000001",
            issuer_did="did:web:snuh.org",
            name="서울대학교병원",
            did_method="did:web",
            credential_types=["FamilyHealthDelegation", "DiagnosisCredential"],
            is_active=True,
        ),
        TrustedIssuerORM(
            issuer_id="a1111111-0000-0000-0000-000000000002",
            issuer_did="did:web:kdca.go.kr",
            name="질병관리청",
            did_method="did:web",
            credential_types=["VaccinationCertificate"],
            is_active=True,
        ),
    ]

    partners = [
        PartnerORM(
            partner_id="b2222222-0000-0000-0000-000000000001",
            name="삼성화재",
            type="insurer",
            partner_did="did:web:samsungfire.com",
            api_key_hash=sha256("samsungfire-api-key"),
            status="active",
        ),
        PartnerORM(
            partner_id="b2222222-0000-0000-0000-000000000002",
            name="서울대학교병원",
            type="hospital",
            partner_did="did:web:snuh.org",
            api_key_hash=sha256("snuh-api-key"),
            status="active",
        ),
    ]

    medical_institutions = [
        MedicalInstitutionORM(
            institution_id="c3333333-0000-0000-0000-000000000001",
            name="서울대학교병원",
            type="hospital",
            region="서울 종로구",
            fhir_endpoint="https://fhir.snuh.org/r4",
        ),
        MedicalInstitutionORM(
            institution_id="c3333333-0000-0000-0000-000000000002",
            name="강남세브란스병원",
            type="hospital",
            region="서울 강남구",
            fhir_endpoint="https://fhir.gangnam.severance.org/r4",
        ),
        MedicalInstitutionORM(
            institution_id="c3333333-0000-0000-0000-000000000003",
            name="온누리약국",
            type="pharmacy",
            region="서울 강남구",
            fhir_endpoint=None,
        ),
    ]

    drugs = [
        DrugORM(drug_code="K-647100660", drug_name="아세트아미노펜정 500mg", atc_class="N02BE01", form="정제"),
        DrugORM(drug_code="K-642700420", drug_name="아스피린장용정 100mg", atc_class="B01AC06", form="장용정"),
        DrugORM(drug_code="K-650300010", drug_name="와파린나트륨정 5mg", atc_class="B01AA03", form="정제"),
    ]

    drug_interactions = [
        DrugInteractionORM(
            drug_code_a="K-642700420",
            drug_code_b="K-650300010",
            severity="high",
            description="아스피린과 와파린 병용 시 출혈 위험이 증가합니다.",
        ),
    ]

    chain_configs = [
        ChainConfigORM(
            chain_network="hardhat_local",
            default_method="smart_contract",
            contract_address="0x5FbDB2315678afecb367f032d93F642f64180aa3",
            explorer_base_url="http://127.0.0.1:8545",
            is_active=True,
        ),
        ChainConfigORM(
            chain_network="polygon_amoy",
            default_method="smart_contract",
            contract_address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            explorer_base_url="https://amoy.polygonscan.com",
            is_active=False,
        ),
    ]

    # --- 진료기록 + 앵커 (해시 일관성 유지) ---
    rec1_hash = sha256("record:diagnosis:minjun:hypertension")
    rec2_hash = sha256("record:prescription:minjun:acetaminophen")
    rec3_hash = sha256("record:checkup:seoyeon:annual")

    medical_records = [
        MedicalRecordORM(
            record_id="d4444444-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            institution_id="c3333333-0000-0000-0000-000000000001",
            category="diagnosis",
            fhir_resource_type="Condition",
            mongo_resource_id="mongo_cond_0001",
            integrity_hash=rec1_hash,
            visit_date=date(2026, 5, 10),
        ),
        MedicalRecordORM(
            record_id="d4444444-0000-0000-0000-000000000002",
            user_id="11111111-1111-1111-1111-111111111111",
            institution_id="c3333333-0000-0000-0000-000000000001",
            category="prescription",
            fhir_resource_type="MedicationRequest",
            mongo_resource_id="mongo_med_0002",
            integrity_hash=rec2_hash,
            visit_date=date(2026, 5, 10),
        ),
        MedicalRecordORM(
            record_id="d4444444-0000-0000-0000-000000000003",
            user_id="22222222-2222-2222-2222-222222222222",
            institution_id="c3333333-0000-0000-0000-000000000002",
            category="checkup",
            fhir_resource_type="Observation",
            mongo_resource_id="mongo_obs_0003",
            integrity_hash=rec3_hash,
            visit_date=date(2026, 4, 2),
        ),
    ]

    blockchain_anchors = [
        BlockchainAnchorORM(
            anchor_id="e5555555-0000-0000-0000-000000000001",
            record_id="d4444444-0000-0000-0000-000000000001",
            hash_value=rec1_hash,
            chain_network="hardhat_local",
            tx_hash="0x" + sha256("tx:rec1"),
            block_number=1024,
            status="anchored",
            anchored_at=NOW - timedelta(days=38),
        ),
        BlockchainAnchorORM(
            anchor_id="e5555555-0000-0000-0000-000000000002",
            record_id="d4444444-0000-0000-0000-000000000002",
            hash_value=rec2_hash,
            chain_network="hardhat_local",
            tx_hash="0x" + sha256("tx:rec2"),
            block_number=1025,
            status="anchored",
            anchored_at=NOW - timedelta(days=38),
        ),
        BlockchainAnchorORM(
            anchor_id="e5555555-0000-0000-0000-000000000003",
            record_id="d4444444-0000-0000-0000-000000000003",
            hash_value=rec3_hash,
            chain_network="hardhat_local",
            tx_hash=None,
            block_number=None,
            status="pending",
            anchored_at=None,
        ),
    ]

    verifiable_credentials = [
        VerifiableCredentialORM(
            vc_id="f6666666-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            type_code="FamilyHealthDelegation",
            issuer_id="a1111111-0000-0000-0000-000000000001",
            format="sd_jwt_vc",
            mongo_doc_id="mongo_vc_0001",
            status="valid",
            issued_at=NOW - timedelta(days=30),
            expires_at=NOW + timedelta(days=335),
        ),
        VerifiableCredentialORM(
            vc_id="f6666666-0000-0000-0000-000000000002",
            user_id="22222222-2222-2222-2222-222222222222",
            type_code="VaccinationCertificate",
            issuer_id="a1111111-0000-0000-0000-000000000002",
            format="sd_jwt_vc",
            mongo_doc_id="mongo_vc_0002",
            status="valid",
            issued_at=NOW - timedelta(days=120),
            expires_at=None,
        ),
    ]

    prescriptions = [
        PrescriptionORM(
            prescription_id="07777777-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            record_id="d4444444-0000-0000-0000-000000000002",
            institution_id="c3333333-0000-0000-0000-000000000001",
            drug_code="K-647100660",
            dosage="1정 1일 3회",
            duration_days=5,
            prescribed_date=date(2026, 5, 10),
        ),
    ]

    emergency_medical_info = [
        EmergencyMedicalInfoORM(
            user_id="11111111-1111-1111-1111-111111111111",
            blood_type="A+",
            allergies=["페니실린", "땅콩"],
            chronic_conditions=["고혈압"],
            emergency_contact="010-9876-5432 (배우자)",
        ),
        EmergencyMedicalInfoORM(
            user_id="22222222-2222-2222-2222-222222222222",
            blood_type="O+",
            allergies=[],
            chronic_conditions=[],
            emergency_contact="010-1234-5678 (부)",
        ),
    ]

    emergency_access = [
        EmergencyAccessORM(
            emergency_id="18888888-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            hospital_id="c3333333-0000-0000-0000-000000000002",
            granted_items=["blood_type", "allergies", "chronic_conditions"],
            reason="응급실 내원 — 의식 저하",
            status="active",
            granted_at=NOW - timedelta(hours=3),
            expires_at=NOW + timedelta(hours=21),
        ),
    ]

    access_logs = [
        AccessLogORM(
            log_id="29999999-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            accessor_did="did:web:snuh.org",
            accessor_type="hospital",
            record_id="d4444444-0000-0000-0000-000000000001",
            access_type="read",
            result="success",
            ip_address="203.0.113.10",
            accessed_at=NOW - timedelta(days=2),
        ),
        AccessLogORM(
            log_id="29999999-0000-0000-0000-000000000002",
            user_id="11111111-1111-1111-1111-111111111111",
            accessor_did="did:web:samsungfire.com",
            accessor_type="insurer",
            record_id="d4444444-0000-0000-0000-000000000002",
            access_type="verify",
            result="success",
            ip_address="203.0.113.55",
            accessed_at=NOW - timedelta(days=1),
        ),
    ]

    share_consents = [
        ShareConsentORM(
            share_id="3aaaaaaa-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            recipient_type="doctor",
            recipient_did="did:web:snuh.org:doctor:kim",
            shared_items=["d4444444-0000-0000-0000-000000000001"],
            disclosure_method="sd_jwt",
            redis_token_key="vitalink:share_token:demo-token-abc123",
            status="issued",
            issued_at=NOW - timedelta(minutes=10),
            expires_at=NOW + timedelta(hours=1),
            used_at=None,
        ),
    ]

    subscriptions = [
        SubscriptionORM(
            subscription_id="4bbbbbbb-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            plan="premium",
            started_at=NOW - timedelta(days=60),
            expires_at=NOW + timedelta(days=305),
            status="active",
        ),
        SubscriptionORM(
            subscription_id="4bbbbbbb-0000-0000-0000-000000000002",
            user_id="22222222-2222-2222-2222-222222222222",
            plan="free",
            started_at=NOW - timedelta(days=10),
            expires_at=None,
            status="active",
        ),
    ]

    insurance_claims = [
        InsuranceClaimORM(
            claim_id="5ccccccc-0000-0000-0000-000000000001",
            user_id="11111111-1111-1111-1111-111111111111",
            partner_id="b2222222-0000-0000-0000-000000000001",
            claim_amount=Decimal("125000.00"),
            status="submitted",
            submitted_at=NOW - timedelta(days=5),
        ),
    ]

    insurance_claim_records = [
        InsuranceClaimRecordORM(
            claim_id="5ccccccc-0000-0000-0000-000000000001",
            record_id="d4444444-0000-0000-0000-000000000001",
        ),
    ]

    # FK 의존성 순서대로 평탄화
    return [
        *users,
        *credential_type_defs,
        *trusted_issuers,
        *partners,
        *medical_institutions,
        *drugs,
        *drug_interactions,
        *chain_configs,
        *medical_records,
        *blockchain_anchors,
        *verifiable_credentials,
        *prescriptions,
        *emergency_medical_info,
        *emergency_access,
        *access_logs,
        *share_consents,
        *subscriptions,
        *insurance_claims,
        *insurance_claim_records,
    ]


async def run_seed(maker) -> int:
    """세션 팩토리를 받아 목업 데이터를 upsert한다. main.py lifespan에서도 호출 가능."""
    rows = build_rows()
    async with maker() as session:
        for row in rows:
            await session.merge(row)  # PK 기준 upsert (멱등)
        await session.commit()
    return len(rows)


async def seed() -> None:
    init_engine()
    await ensure_tables()  # 테이블이 없으면 생성

    if async_session_maker is None:
        from core.database import async_session_maker as maker
    else:
        maker = async_session_maker

    if maker is None:
        print("세션 팩토리 초기화 실패 — DATABASE_URL 을 확인하세요.")
        sys.exit(1)

    count = await run_seed(maker)
    print(f"목업 데이터 시드 완료: {count} 행 (19개 테이블)")


if __name__ == "__main__":
    asyncio.run(seed())
