from datetime import date
from typing import Optional, List

from app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus


def calculate_progress(project: Project) -> float:
    """Calculates the percentage of completed milestones.
    
    Returns 0.0 safely if the project has no milestones without raising ZeroDivisionError.
    """
    if not project.milestones:
        return 0.0

    completed_count = sum(
        1
        for m in project.milestones
        if m.status in (MilestoneStatus.COMPLETED.value, MilestoneStatus.COMPLETED)
    )
    total_count = len(project.milestones)
    return round((completed_count / total_count) * 100.0, 1)


def get_current_stage(project: Project) -> str:
    """Determines the current technical stage of a project.
    
    Returns the stage of the first incomplete milestone.
    If all milestones are completed, returns DONE.
    If no milestones exist, defaults to PLANNING.
    """
    if not project.milestones:
        return ProjectStage.PLANNING.value

    for milestone in project.milestones:
        if milestone.status not in (MilestoneStatus.COMPLETED.value, MilestoneStatus.COMPLETED):
            stage_val = milestone.stage
            return stage_val.value if hasattr(stage_val, "value") else str(stage_val)

    return ProjectStage.DONE.value


def calculate_project_health(project: Project, today: Optional[date] = None) -> HealthStatus:
    """Calculates the dynamic health status of a project.
    
    Rules:
    1. COMPLETED: If the project has milestones and all are completed.
    2. DELAYED: If target_date < today and project is not completed.
    3. AT_RISK:
       - If within 7 days of target_date (0 <= days_remaining <= 7) and progress < 70%.
       - Or if remaining time is less than 30% of total schedule and stage is still PLANNING or DESIGN.
    4. ON_TRACK: Otherwise.
    """
    if today is None:
        today = date.today()

    target_date = project.target_date
    if hasattr(target_date, "date"):
        target_date = target_date.date()

    has_milestones = bool(project.milestones)
    all_completed = has_milestones and all(
        m.status in (MilestoneStatus.COMPLETED.value, MilestoneStatus.COMPLETED)
        for m in project.milestones
    )

    # Rule 1: COMPLETED
    if all_completed:
        return HealthStatus.COMPLETED

    # Rule 2: DELAYED
    if target_date < today:
        return HealthStatus.DELAYED

    # Calculate metrics for Rule 3
    days_remaining = (target_date - today).days
    progress = calculate_progress(project)
    current_stage = get_current_stage(project)

    # Rule 3a: Within 7 days and low progress (< 70%)
    if 0 <= days_remaining <= 7 and progress < 70.0:
        return HealthStatus.AT_RISK

    # Rule 3b: Early stage (PLANNING/DESIGN) with less than 30% schedule time remaining
    if project.created_at is not None:
        created_date = project.created_at.date() if hasattr(project.created_at, "date") else project.created_at
        total_days = (target_date - created_date).days
        if total_days > 0 and days_remaining >= 0:
            remaining_ratio = days_remaining / total_days
            if remaining_ratio < 0.3 and current_stage in (
                ProjectStage.PLANNING.value,
                ProjectStage.DESIGN.value,
                "PLANNING",
                "DESIGN",
            ):
                return HealthStatus.AT_RISK

    # Rule 4: ON_TRACK
    return HealthStatus.ON_TRACK


def generate_default_milestones(project_id: Optional[int] = None) -> List[Milestone]:
    """Generates the 5 default base milestones for a newly created software project."""
    default_templates = [
        ("Definición de alcance y arquitectura", ProjectStage.PLANNING.value),
        ("Diseño de interfaz y contratos", ProjectStage.DESIGN.value),
        ("Construcción e implementación", ProjectStage.DEVELOPMENT.value),
        ("Pruebas y aseguramiento de calidad", ProjectStage.TESTING.value),
        ("Pase a producción", ProjectStage.READY_FOR_DEPLOY.value),
    ]

    return [
        Milestone(
            project_id=project_id,
            title=title,
            stage=stage,
            status=MilestoneStatus.PENDING.value,
        )
        for title, stage in default_templates
    ]
