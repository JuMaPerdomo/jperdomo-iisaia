import datetime
from datetime import date, timedelta
import pytest

from app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus
from app.services import (
    calculate_progress,
    get_current_stage,
    calculate_project_health,
    generate_default_milestones,
)


def test_calculate_progress_zero_milestones():
    project = Project(
        name="Empty Project",
        target_date=date(2026, 12, 31),
    )
    project.milestones = []
    # Should safely return 0.0 without ZeroDivisionError
    assert calculate_progress(project) == 0.0


def test_calculate_progress_partial_and_full():
    project = Project(
        name="Sample Project",
        target_date=date(2026, 12, 31),
    )
    m1 = Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value)
    m2 = Milestone(title="M2", stage=ProjectStage.DESIGN.value, status=MilestoneStatus.PENDING.value)
    project.milestones = [m1, m2]
    # 1 of 2 completed
    assert calculate_progress(project) == 50.0

    m3 = Milestone(title="M3", stage=ProjectStage.DEVELOPMENT.value, status=MilestoneStatus.COMPLETED.value)
    project.milestones = [m1, m2, m3]
    # 2 of 3 completed -> 66.7%
    assert calculate_progress(project) == 66.7

    m2.status = MilestoneStatus.COMPLETED.value
    # 3 of 3 completed -> 100.0%
    assert calculate_progress(project) == 100.0


def test_get_current_stage():
    project = Project(
        name="Pipeline Project",
        target_date=date(2026, 12, 31),
    )
    # 0 milestones -> defaults to PLANNING
    project.milestones = []
    assert get_current_stage(project) == ProjectStage.PLANNING.value

    m1 = Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value)
    m2 = Milestone(title="M2", stage=ProjectStage.DESIGN.value, status=MilestoneStatus.IN_PROGRESS.value)
    m3 = Milestone(title="M3", stage=ProjectStage.DEVELOPMENT.value, status=MilestoneStatus.PENDING.value)
    project.milestones = [m1, m2, m3]

    # First incomplete milestone is DESIGN
    assert get_current_stage(project) == ProjectStage.DESIGN.value

    # Complete M2 -> Next is DEVELOPMENT
    m2.status = MilestoneStatus.COMPLETED.value
    assert get_current_stage(project) == ProjectStage.DEVELOPMENT.value

    # Complete M3 -> All completed -> DONE
    m3.status = MilestoneStatus.COMPLETED.value
    assert get_current_stage(project) == ProjectStage.DONE.value


def test_health_completed():
    today = date(2026, 10, 11)
    # Even if target_date was in the past, if all milestones are completed -> COMPLETED
    project = Project(
        name="Completed Past Due",
        target_date=today - timedelta(days=10),
    )
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage=ProjectStage.READY_FOR_DEPLOY.value, status=MilestoneStatus.COMPLETED.value),
    ]
    assert calculate_project_health(project, today=today) == HealthStatus.COMPLETED


def test_health_delayed_past_due():
    today = date(2026, 10, 11)
    # Target date passed and has incomplete milestone -> DELAYED
    project = Project(
        name="Delayed Project",
        target_date=today - timedelta(days=2),
    )
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage=ProjectStage.DEVELOPMENT.value, status=MilestoneStatus.PENDING.value),
    ]
    assert calculate_project_health(project, today=today) == HealthStatus.DELAYED

    # Target date passed and 0 milestones -> DELAYED
    empty_project = Project(
        name="Delayed Empty",
        target_date=today - timedelta(days=1),
    )
    empty_project.milestones = []
    assert calculate_project_health(empty_project, today=today) == HealthStatus.DELAYED


def test_health_at_risk_within_7_days_low_progress():
    today = date(2026, 10, 11)
    # Target date in 5 days (<= 7 days) and progress is 40% (< 70%) -> AT_RISK
    project = Project(
        name="At Risk Project",
        target_date=today + timedelta(days=5),
    )
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage=ProjectStage.DESIGN.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M3", stage=ProjectStage.DEVELOPMENT.value, status=MilestoneStatus.PENDING.value),
        Milestone(title="M4", stage=ProjectStage.TESTING.value, status=MilestoneStatus.PENDING.value),
        Milestone(title="M5", stage=ProjectStage.READY_FOR_DEPLOY.value, status=MilestoneStatus.PENDING.value),
    ]
    # 2 of 5 = 40.0%
    assert calculate_progress(project) == 40.0
    assert calculate_project_health(project, today=today) == HealthStatus.AT_RISK


def test_health_on_track_within_7_days_high_progress():
    today = date(2026, 10, 11)
    # Target date in 5 days (<= 7 days) and progress is 80% (>= 70%) -> ON_TRACK
    project = Project(
        name="Good Pace Project",
        target_date=today + timedelta(days=5),
    )
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage=ProjectStage.DESIGN.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M3", stage=ProjectStage.DEVELOPMENT.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M4", stage=ProjectStage.TESTING.value, status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M5", stage=ProjectStage.READY_FOR_DEPLOY.value, status=MilestoneStatus.PENDING.value),
    ]
    # 4 of 5 = 80.0%
    assert calculate_progress(project) == 80.0
    assert calculate_project_health(project, today=today) == HealthStatus.ON_TRACK


def test_health_on_track_future_due_date():
    today = date(2026, 10, 11)
    # Target date in 30 days, even with 0% progress -> ON_TRACK
    project = Project(
        name="Plenty of Time",
        target_date=today + timedelta(days=30),
    )
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.PENDING.value),
    ]
    assert calculate_progress(project) == 0.0
    assert calculate_project_health(project, today=today) == HealthStatus.ON_TRACK


def test_health_at_risk_early_stage_low_time_remaining():
    today = date(2026, 10, 11)
    # Project with 10 days remaining out of 100 total days (10% remaining < 30%)
    # Stage is PLANNING, target_date is in 10 days (which is > 7 days)
    project = Project(
        name="Stuck in Planning",
        target_date=today + timedelta(days=10),
    )
    project.created_at = datetime.datetime.combine(today - timedelta(days=90), datetime.time.min)
    project.milestones = [
        Milestone(title="M1", stage=ProjectStage.PLANNING.value, status=MilestoneStatus.PENDING.value),
        Milestone(title="M2", stage=ProjectStage.DESIGN.value, status=MilestoneStatus.PENDING.value),
    ]
    assert calculate_project_health(project, today=today) == HealthStatus.AT_RISK


def test_generate_default_milestones():
    # Calling with project_id
    milestones = generate_default_milestones(project_id=42)
    assert len(milestones) == 5

    expected_stages = [
        ProjectStage.PLANNING.value,
        ProjectStage.DESIGN.value,
        ProjectStage.DEVELOPMENT.value,
        ProjectStage.TESTING.value,
        ProjectStage.READY_FOR_DEPLOY.value,
    ]
    expected_titles = [
        "Definición de alcance y arquitectura",
        "Diseño de interfaz y contratos",
        "Construcción e implementación",
        "Pruebas y aseguramiento de calidad",
        "Pase a producción",
    ]

    for i, m in enumerate(milestones):
        assert m.project_id == 42
        assert m.stage == expected_stages[i]
        assert m.title == expected_titles[i]
        assert m.status == MilestoneStatus.PENDING.value

    # Calling without project_id
    milestones_none = generate_default_milestones()
    assert len(milestones_none) == 5
    assert milestones_none[0].project_id is None
