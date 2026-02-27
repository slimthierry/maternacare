# MaternaCare

Module SIH (Systeme d'Information Hospitalier) de suivi de grossesse et sante maternelle.

## Architecture

Monorepo pnpm + Turborepo avec:

- **Backend**: FastAPI (Python) - Port 9700
- **Frontend**: React + Vite + Tailwind CSS - Port 4000
- **Base de donnees**: PostgreSQL 15
- **Cache**: Redis 7

## Fonctionnalites

- Suivi de grossesse semaine par semaine
- Consultations prenatales avec evaluation des risques
- Echographies et courbes de croissance
- Accouchements et scores APGAR
- Suivi post-partum et score d'Edinburgh
- Gestion des nouveau-nes
- Systeme d'alertes automatiques (pre-eclampsie, diabete gestationnel, RCIU)
- API FHIR compatible (Patient, Condition, Observation, Encounter)
- Audit trail complet
- RBAC: admin, gynecologue, sage_femme, pediatre, infirmier, patiente

## Demarrage rapide

### Prerequis

- Node.js >= 20
- pnpm >= 9
- Python >= 3.11
- Docker & Docker Compose

### Installation

```bash
# Demarrer les services (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 9700

# Frontend
pnpm install
pnpm dev:web
```

### Avec Docker

```bash
docker-compose up -d
```

## Integration SIH

### API FHIR

- `GET /api/fhir/Patient/{ipp}` - Recherche patient par IPP
- `GET /api/fhir/Condition` - Conditions obstetricales
- `GET /api/fhir/Observation` - Observations cliniques
- `GET /api/fhir/Encounter` - Rencontres/consultations

### Webhooks

Le systeme envoie des webhooks pour les evenements critiques:
- `pre_eclampsia_risk` - Risque de pre-eclampsie detecte
- `gestational_diabetes` - Diabete gestationnel detecte
- `abnormal_ultrasound` - Anomalie echographique detectee
- `delivery_imminent` - Accouchement imminent

## Licence

Proprietary - Usage hospitalier uniquement.
