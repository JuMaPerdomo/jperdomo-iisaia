from datetime import date, timedelta
import pytest
from pydantic import ValidationError

from app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    MetricsResponse,
)
from app.crud import (
    create_project,
    get_projects,
    get_project_by_id,
    update_project,
    delete_project,
    add_milestone,
    update_milestone,
    delete_milestone,
    get_dashboard_metrics,
)


def test_create_project_with_default_milestones(db_session):
    project_in = ProjectCreate(
        name="Dashboard Project",
        description="Executive project tracker",
        target_date=date(2026, 12, 31),
    )
    project = create_project(db_session, project_in)

    assert project.id is not None
    assert project.name == "Dashboard Project"
    assert project.description == "Executive project tracker"
    assert project.target_date == date(2026, 12, 31)

    # Verify 5 default milestones were automatically created
    assert len(project.milestones) == 5
    expected_stages = [
        ProjectStage.PLANNING.value,
        ProjectStage.DESIGN.value,
        ProjectStage.DEVELOPMENT.value,
        ProjectStage.TESTING.value,
        ProjectStage.READY_FOR_DEPLOY.value,
    ]
    for idx, milestone in enumerate(project.milestones):
        assert milestone.stage == expected_stages[idx]
        assert milestone.status == MilestoneStatus.PENDING.value
        assert milestone.project_id == project.id


def test_get_projects_and_filtering(db_session):
    today = date.today()
    # P1: Future target date -> ON_TRACK
    p1 = create_project(
        db_session,
        ProjectCreate(
            name="Alpha Portal",
            description="Web frontend portal",
            target_date=today + timedelta(days=60),
        ),
    )
    # P2: Past target date -> DELAYED
    p2 = create_project(
        db_session,
        ProjectCreate(
            name="Beta Backend",
            description="Legacy migration backend",
            target_date=today - timedelta(days=5),
        ),
    )
    # P3: Future target date, complete all milestones -> COMPLETED
    p3 = create_project(
        db_session,
        ProjectCreate(
            name="Gamma Mobile",
            description="Mobile app",
            target_date=today + timedelta(days=30),
        ),
    )
    for m in p3.milestones:
        m.status = MilestoneStatus.COMPLETED.value
    db_session.commit()

    # List all
    all_projects = get_projects(db_session)
    assert len(all_projects) == 3

    # Filter search by name
    results_alpha = get_projects(db_session, search="Alpha")
    assert len(results_alpha) == 1
    assert results_alpha[0].id == p1.id

    # Filter search by description
    results_migration = get_projects(db_session, search="migration")
    assert len(results_migration) == 1
    assert results_migration[0].id == p2.id

    # Filter by health status
    delayed_projects = get_projects(db_session, health="DELAYED")
    assert len(delayed_projects) == 1
    assert delayed_projects[0].id == p2.id

    completed_projects = get_projects(db_session, health="COMPLETED")
    assert len(completed_projects) == 1
    assert completed_projects[0].id == p3.id

    on_track_projects = get_projects(db_session, health="ON_TRACK")
    assert len(on_track_projects) == 1
    assert on_track_projects[0].id == p1.id

    # Filter by stage: p1 and p2 have pending milestones, so first incomplete is PLANNING
    planning_projects = get_projects(db_session, stage="PLANNING")
    assert len(planning_projects) == 2

    # p3 all completed -> stage is DONE
    done_projects = get_projects(db_session, stage="DONE")
    assert len(done_projects) == 1
    assert done_projects[0].id == p3.id

    # Combined filter: search + health
    combined = get_projects(db_session, search="Alpha", health="ON_TRACK")
    assert len(combined) == 1
    assert combined[0].id == p1.id

    no_match = get_projects(db_session, search="Alpha", health="DELAYED")
    assert len(no_match) == 0


def test_get_project_by_id(db_session):
    p = create_project(
        db_session,
        ProjectCreate(name="Single Project", target_date=date(2026, 12, 31)),
    )
    found = get_project_by_id(db_session, p.id)
    assert found is not None
    assert found.id == p.id
    assert len(found.milestones) == 5

    not_found = get_project_by_id(db_session, 99999)
    assert not_found is None


def test_update_project(db_session):
    p = create_project(
        db_session,
        ProjectCreate(
            name="Original Name",
            description="Original Description",
            target_date=date(2026, 10, 1),
        ),
    )
    updated = update_project(
        db_session,
        p.id,
        ProjectUpdate(
            name="New Name",
            description="Updated Description",
            target_date=date(2026, 11, 1),
        ),
    )
    assert updated is not None
    assert updated.name == "New Name"
    assert updated.description == "Updated Description"
    assert updated.target_date == date(2026, 11, 1)

    # Partial update
    partial = update_project(
        db_session,
        p.id,
        ProjectUpdate(name="Only Name Changed"),
    )
    assert partial is not None
    assert partial.name == "Only Name Changed"
    assert partial.description == "Updated Description"

    # Non-existent project
    none_result = update_project(db_session, 99999, ProjectUpdate(name="Ghost"))
    assert none_result is None


def test_delete_project_cascade(db_session):
    p = create_project(
        db_session,
        ProjectCreate(name="To Delete", target_date=date(2026, 12, 31)),
    )
    p_id = p.id
    milestone_ids = [m.id for m in p.milestones]
    assert len(milestone_ids) == 5

    # Delete project
    deleted = delete_project(db_session, p_id)
    assert deleted is True

    # Check project is deleted
    assert get_project_by_id(db_session, p_id) is None

    # Check all milestones cascaded
    for m_id in milestone_ids:
        assert db_session.query(Milestone).filter(Milestone.id == m_id).first() is None

    # Non-existent project deletion returns False
    assert delete_project(db_session, 99999) is False


def test_milestone_crud_operations(db_session):
    p = create_project(
        db_session,
        ProjectCreate(name="Milestone Host", target_date=date(2026, 12, 31)),
    )
    # Add milestone
    new_m = add_milestone(
        db_session,
        p.id,
        MilestoneCreate(
            title="Extra Security Audit",
            stage=ProjectStage.TESTING.value,
            due_date=date(2026, 11, 20),
        ),
    )
    assert new_m is not None
    assert new_m.id is not None
    assert new_m.title == "Extra Security Audit"
    assert new_m.stage == ProjectStage.TESTING.value
    assert new_m.status == MilestoneStatus.PENDING.value
    assert new_m.project_id == p.id

    # Add milestone to non-existent project returns None
    assert (
        add_milestone(
            db_session,
            99999,
            MilestoneCreate(title="Invalid", stage="PLANNING"),
        )
        is None
    )

    # Update milestone
    updated_m = update_milestone(
        db_session,
        new_m.id,
        MilestoneUpdate(
            title="Updated Audit Title",
            status=MilestoneStatus.COMPLETED.value,
        ),
    )
    assert updated_m is not None
    assert updated_m.title == "Updated Audit Title"
    assert updated_m.status == MilestoneStatus.COMPLETED.value

    # Update non-existent milestone returns None
    assert (
        update_milestone(
            db_session,
            99999,
            MilestoneUpdate(title="Ghost"),
        )
        is None
    )

    # Delete milestone
    deleted = delete_milestone(db_session, new_m.id)
    assert deleted is True
    assert db_session.query(Milestone).filter(Milestone.id == new_m.id).first() is None

    # Delete non-existent milestone returns False
    assert delete_milestone(db_session, 99999) is False


def test_get_dashboard_metrics(db_session):
    today = date.today()

    # 1. ON_TRACK project (future target date, pending milestones)
    p1 = create_project(
        db_session,
        ProjectCreate(name="On Track Project", target_date=today + timedelta(days=60)),
    )

    # 2. DELAYED project (target date in past)
    p2 = create_project(
        db_session,
        ProjectCreate(name="Delayed Project", target_date=today - timedelta(days=2)),
    )

    # 3. COMPLETED project (all milestones done)
    p3 = create_project(
        db_session,
        ProjectCreate(name="Completed Project", target_date=today + timedelta(days=10)),
    )
    for m in p3.milestones:
        m.status = MilestoneStatus.COMPLETED.value
    db_session.commit()

    # 4. AT_RISK project (target date in 5 days, 40% progress)
    p4 = create_project(
        db_session,
        ProjectCreate(name="At Risk Project", target_date=today + timedelta(days=5)),
    )
    # 5 default milestones: complete 2 of 5 = 40%
    p4.milestones[0].status = MilestoneStatus.COMPLETED.value
    p4.milestones[1].status = MilestoneStatus.COMPLETED.value
    db_session.commit()

    metrics = get_dashboard_metrics(db_session)

    assert isinstance(metrics, MetricsResponse)
    assert metrics.total_projects == 4
    assert metrics.active_projects == 3
    assert metrics.completed_projects == 1

    assert metrics.health_summary.on_track == 1
    assert metrics.health_summary.at_risk == 1
    assert metrics.health_summary.delayed == 1
    assert metrics.health_summary.completed == 1

    # Check stage distribution counts all 6 stages
    for stage_val in [
        ProjectStage.PLANNING.value,
        ProjectStage.DESIGN.value,
        ProjectStage.DEVELOPMENT.value,
        ProjectStage.TESTING.value,
        ProjectStage.READY_FOR_DEPLOY.value,
        ProjectStage.DONE.value,
    ]:
        assert stage_val in metrics.stage_distribution

    assert metrics.stage_distribution[ProjectStage.DONE.value] == 1
    # p4 has milestones 0 (PLANNING) and 1 (DESIGN) completed, next is DEVELOPMENT
    assert metrics.stage_distribution[ProjectStage.DEVELOPMENT.value] == 1


def test_schemas_validation(db_session):
    # Empty project name
    with pytest.raises(ValidationError):
        ProjectCreate(name="", target_date=date(2026, 12, 31))

    with pytest.raises(ValidationError):
        ProjectCreate(name="   ", target_date=date(2026, 12, 31))

    # Project name too long (> 100)
    with pytest.raises(ValidationError):
        ProjectCreate(name="x" * 101, target_date=date(2026, 12, 31))

    # Empty milestone title
    with pytest.raises(ValidationError):
        MilestoneCreate(title="")

    with pytest.raises(ValidationError):
        MilestoneCreate(title="   ")

    # ProjectResponse serialization from ORM Project object
    project = create_project(
        db_session,
        ProjectCreate(
            name="Serialized Project",
            description="Testing serialization",
            target_date=date.today() + timedelta(days=40),
        ),
    )
    # Validate ORM to ProjectResponse
    response = ProjectResponse.model_validate(project)
    assert response.id == project.id
    assert response.name == "Serialized Project"
    assert response.current_stage == ProjectStage.PLANNING.value
    assert response.progress == 0.0
    assert response.health_status == HealthStatus.ON_TRACK.value
    assert len(response.milestones) == 5
    assert isinstance(response.milestones[0], MilestoneResponse)

    # ProjectUpdate validations
    with pytest.raises(ValidationError):
        ProjectUpdate(name="")

    with pytest.raises(ValidationError):
        ProjectUpdate(name="   ")

    with pytest.raises(ValidationError):
        ProjectUpdate(name="x" * 101)

    # MilestoneUpdate validations
    with pytest.raises(ValidationError):
        MilestoneUpdate(title="")

    with pytest.raises(ValidationError):
        MilestoneUpdate(title="   ")

    # ProjectResponse from project with 0 milestones
    empty_p = Project(
        name="Zero Milestones",
        target_date=date.today() + timedelta(days=20),
    )
    db_session.add(empty_p)
    db_session.commit()
    db_session.refresh(empty_p)

    empty_resp = ProjectResponse.model_validate(empty_p)
    assert empty_resp.progress == 0.0
    assert empty_resp.current_stage == ProjectStage.PLANNING.value
    assert empty_resp.health_status == HealthStatus.ON_TRACK.value
    assert empty_resp.milestones == []


def test_get_dashboard_metrics_empty(db_session):
    metrics = get_dashboard_metrics(db_session)
    assert metrics.total_projects == 0
    assert metrics.active_projects == 0
    assert metrics.completed_projects == 0
    assert metrics.health_summary.on_track == 0
    assert metrics.health_summary.at_risk == 0
    assert metrics.health_summary.delayed == 0
    assert metrics.health_summary.completed == 0
    for stage_val in ProjectStage:
        assert metrics.stage_distribution[stage_val.value] == 0

