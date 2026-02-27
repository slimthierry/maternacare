"""FHIR-compatible schemas for SIH integration."""

from datetime import datetime

from pydantic import BaseModel


# --- FHIR Patient ---

class FHIRIdentifier(BaseModel):
    """FHIR Identifier type."""

    system: str
    value: str


class FHIRHumanName(BaseModel):
    """FHIR HumanName type."""

    family: str
    given: list[str]


class FHIRPatient(BaseModel):
    """FHIR Patient resource."""

    resourceType: str = "Patient"
    id: str
    identifier: list[FHIRIdentifier]
    name: list[FHIRHumanName]
    gender: str
    birthDate: str


# --- FHIR Condition ---

class FHIRCoding(BaseModel):
    """FHIR Coding type."""

    system: str
    code: str
    display: str


class FHIRCodeableConcept(BaseModel):
    """FHIR CodeableConcept type."""

    coding: list[FHIRCoding]
    text: str | None = None


class FHIRReference(BaseModel):
    """FHIR Reference type."""

    reference: str
    display: str | None = None


class FHIRCondition(BaseModel):
    """FHIR Condition resource for obstetric complications."""

    resourceType: str = "Condition"
    id: str
    subject: FHIRReference
    code: FHIRCodeableConcept
    clinicalStatus: FHIRCodeableConcept
    severity: FHIRCodeableConcept | None = None
    onsetDateTime: str | None = None
    recordedDate: str


# --- FHIR Observation ---

class FHIRQuantity(BaseModel):
    """FHIR Quantity type."""

    value: float
    unit: str
    system: str = "http://unitsofmeasure.org"
    code: str


class FHIRObservation(BaseModel):
    """FHIR Observation resource for clinical measurements."""

    resourceType: str = "Observation"
    id: str
    status: str = "final"
    category: list[FHIRCodeableConcept] | None = None
    code: FHIRCodeableConcept
    subject: FHIRReference
    effectiveDateTime: str
    valueQuantity: FHIRQuantity | None = None
    valueString: str | None = None


# --- FHIR Encounter ---

class FHIRPeriod(BaseModel):
    """FHIR Period type."""

    start: str
    end: str | None = None


class FHIREncounter(BaseModel):
    """FHIR Encounter resource for consultations."""

    resourceType: str = "Encounter"
    id: str
    status: str
    class_: FHIRCoding | None = None
    type: list[FHIRCodeableConcept] | None = None
    subject: FHIRReference
    period: FHIRPeriod
    participant: list[FHIRReference] | None = None

    class Config:
        populate_by_name = True


# --- FHIR Bundle ---

class FHIRBundleEntry(BaseModel):
    """FHIR Bundle entry."""

    resource: dict


class FHIRBundle(BaseModel):
    """FHIR Bundle resource."""

    resourceType: str = "Bundle"
    type: str = "searchset"
    total: int
    entry: list[FHIRBundleEntry]
