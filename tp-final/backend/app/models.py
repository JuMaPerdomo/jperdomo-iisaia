import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ProjectStage(str, enum.Enum):
    PLANNING = "PLANNING"
    DESIGN = "DESIGN"
    DEVELOPMENT = "DEVELOPMENT"
    TESTING = "TESTING"
    READY_FOR_DEPLOY = "READY_FOR_DEPLOY"
    DONE = "DONE"


class HealthStatus(str, enum.Enum):
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    DELAYED = "DELAYED"
    COMPLETED = "COMPLETED"


class MilestoneStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    milestones = relationship(
        "Milestone",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="Milestone.id",
    )


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    title = Column(String(200), nullable=False)
    stage = Column(String(50), nullable=False, default=ProjectStage.PLANNING.value)
    status = Column(String(50), nullable=False, default=MilestoneStatus.PENDING.value)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="milestones")
