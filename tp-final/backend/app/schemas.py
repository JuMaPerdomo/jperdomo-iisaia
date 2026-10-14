from datetime import date, datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models import ProjectStage, HealthStatus, MilestoneStatus
from app.services import calculate_progress, get_current_stage, calculate_project_health


# --- Milestone Schemas ---

class MilestoneBase(BaseModel):
    title: str
    stage: str = ProjectStage.PLANNING.value
    due_date: Optional[date] = None


class MilestoneCreate(MilestoneBase):
    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Milestone title cannot be empty")
        return v.strip()


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    stage: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Milestone title cannot be empty")
            return v.strip()
        return v


class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_date: date


class ProjectCreate(ProjectBase):
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Project name cannot be empty")
        v_stripped = v.strip()
        if len(v_stripped) > 100:
            raise ValueError("Project name cannot exceed 100 characters")
        return v_stripped


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Project name cannot be empty")
            v_stripped = v.strip()
            if len(v_stripped) > 100:
                raise ValueError("Project name cannot exceed 100 characters")
            return v_stripped
        return v


class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    current_stage: str
    progress: float
    health_status: str
    milestones: list[MilestoneResponse] = []

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def populate_computed_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return data

        # ORM object conversion
        health = calculate_project_health(data)
        health_val = health.value if hasattr(health, "value") else str(health)
        stage_val = get_current_stage(data)
        progress_val = calculate_progress(data)

        return {
            "id": getattr(data, "id", None),
            "name": getattr(data, "name", None),
            "description": getattr(data, "description", None),
            "target_date": getattr(data, "target_date", None),
            "created_at": getattr(data, "created_at", None),
            "updated_at": getattr(data, "updated_at", None),
            "current_stage": stage_val,
            "progress": progress_val,
            "health_status": health_val,
            "milestones": getattr(data, "milestones", []),
        }


# --- Dashboard Metrics Schemas ---

class HealthSummary(BaseModel):
    on_track: int = 0
    at_risk: int = 0
    delayed: int = 0
    completed: int = 0


class MetricsResponse(BaseModel):
    total_projects: int = 0
    active_projects: int = 0
    completed_projects: int = 0
    health_summary: HealthSummary
    stage_distribution: dict[str, int]
