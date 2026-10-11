from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    MilestoneCreate,
    MilestoneUpdate,
    MetricsResponse,
    HealthSummary,
)
from app.services import (
    generate_default_milestones,
    calculate_progress,
    get_current_stage,
    calculate_project_health,
)


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    """Creates a new Project and automatically initializes the 5 default base milestones."""
    project = Project(
        name=project_in.name,
        description=project_in.description,
        target_date=project_in.target_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    default_milestones = generate_default_milestones(project_id=project.id)
    db.add_all(default_milestones)
    db.commit()

    return (
        db.query(Project)
        .options(joinedload(Project.milestones))
        .filter(Project.id == project.id)
        .first()
    )


def get_projects(
    db: Session,
    stage: Optional[str] = None,
    health: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Project]:
    """Retrieves all projects with eager-loaded milestones, supporting text search and

    in-memory post-filtering by computed stage and health status.
    """
    query = db.query(Project).options(joinedload(Project.milestones))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Project.name.ilike(search_pattern),
                Project.description.ilike(search_pattern),
            )
        )

    query = query.order_by(Project.id.asc())
    # Deduplicate while preserving order in case joinedload repeats root entities
    seen_ids = set()
    projects = []
    for p in query.all():
        if p.id not in seen_ids:
            seen_ids.add(p.id)
            projects.append(p)

    filtered_projects: List[Project] = []
    for project in projects:
        if stage:
            project_stage = get_current_stage(project)
            stage_str = (
                project_stage.value
                if hasattr(project_stage, "value")
                else str(project_stage)
            )
            if stage_str.upper() != stage.upper():
                continue

        if health:
            project_health = calculate_project_health(project)
            health_str = (
                project_health.value
                if hasattr(project_health, "value")
                else str(project_health)
            )
            if health_str.upper() != health.upper():
                continue

        filtered_projects.append(project)

    return filtered_projects


def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
    """Retrieves a single project by its primary key with eager-loaded milestones."""
    return (
        db.query(Project)
        .options(joinedload(Project.milestones))
        .filter(Project.id == project_id)
        .first()
    )


def update_project(
    db: Session, project_id: int, project_in: ProjectUpdate
) -> Optional[Project]:
    """Updates fields of an existing project."""
    project = (
        db.query(Project)
        .options(joinedload(Project.milestones))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        return None

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> bool:
    """Deletes a project and cascades deletion to all associated milestones."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False

    db.delete(project)
    db.commit()
    return True


def add_milestone(
    db: Session, project_id: int, milestone_in: MilestoneCreate
) -> Optional[Milestone]:
    """Adds a new milestone to a specified project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    milestone = Milestone(
        project_id=project_id,
        title=milestone_in.title,
        stage=milestone_in.stage,
        due_date=milestone_in.due_date,
        status=MilestoneStatus.PENDING.value,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


def update_milestone(
    db: Session, milestone_id: int, milestone_in: MilestoneUpdate
) -> Optional[Milestone]:
    """Updates fields of an existing milestone."""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        return None

    update_data = milestone_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(milestone, field, value)

    milestone.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(milestone)
    return milestone


def delete_milestone(db: Session, milestone_id: int) -> bool:
    """Deletes a single milestone."""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        return False

    db.delete(milestone)
    db.commit()
    return True


def get_dashboard_metrics(db: Session) -> MetricsResponse:
    """Calculates dashboard summary metrics across all projects:

    total, active, completed, health counts, and stage distribution.
    """
    raw_projects = (
        db.query(Project)
        .options(joinedload(Project.milestones))
        .order_by(Project.id.asc())
        .all()
    )
    seen_ids = set()
    projects = []
    for p in raw_projects:
        if p.id not in seen_ids:
            seen_ids.add(p.id)
            projects.append(p)

    total_projects = len(projects)
    health_counts = {
        HealthStatus.ON_TRACK.value: 0,
        HealthStatus.AT_RISK.value: 0,
        HealthStatus.DELAYED.value: 0,
        HealthStatus.COMPLETED.value: 0,
    }

    stage_distribution = {
        ProjectStage.PLANNING.value: 0,
        ProjectStage.DESIGN.value: 0,
        ProjectStage.DEVELOPMENT.value: 0,
        ProjectStage.TESTING.value: 0,
        ProjectStage.READY_FOR_DEPLOY.value: 0,
        ProjectStage.DONE.value: 0,
    }

    for p in projects:
        p_health = calculate_project_health(p)
        h_str = p_health.value if hasattr(p_health, "value") else str(p_health)
        if h_str in health_counts:
            health_counts[h_str] += 1

        p_stage = get_current_stage(p)
        s_str = p_stage.value if hasattr(p_stage, "value") else str(p_stage)
        if s_str in stage_distribution:
            stage_distribution[s_str] += 1
        else:
            stage_distribution[s_str] = 1

    completed_projects = health_counts[HealthStatus.COMPLETED.value]
    active_projects = total_projects - completed_projects

    health_summary = HealthSummary(
        on_track=health_counts[HealthStatus.ON_TRACK.value],
        at_risk=health_counts[HealthStatus.AT_RISK.value],
        delayed=health_counts[HealthStatus.DELAYED.value],
        completed=health_counts[HealthStatus.COMPLETED.value],
    )

    return MetricsResponse(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_projects=completed_projects,
        health_summary=health_summary,
        stage_distribution=stage_distribution,
    )
