import datetime
from app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus


def test_create_project_and_milestones(db_session):
    project = Project(
        name="Dashboard Project",
        description="Software tracking dashboard",
        target_date=datetime.date(2026, 12, 31)
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    assert project.id is not None
    assert project.name == "Dashboard Project"
    assert project.description == "Software tracking dashboard"
    assert project.target_date == datetime.date(2026, 12, 31)
    assert project.created_at is not None
    assert project.updated_at is not None
    assert len(project.milestones) == 0

    milestone = Milestone(
        project_id=project.id,
        title="Planning Phase",
        stage=ProjectStage.PLANNING.value,
        status=MilestoneStatus.PENDING.value,
        due_date=datetime.date(2026, 11, 15)
    )
    db_session.add(milestone)
    db_session.commit()
    db_session.refresh(milestone)
    db_session.refresh(project)

    assert milestone.id is not None
    assert milestone.project_id == project.id
    assert milestone.title == "Planning Phase"
    assert milestone.stage == "PLANNING"
    assert milestone.status == "PENDING"
    assert len(project.milestones) == 1
    assert project.milestones[0].id == milestone.id
    assert milestone.project.id == project.id


def test_cascade_delete(db_session):
    project = Project(
        name="Project to delete",
        description="Testing cascade delete",
        target_date=datetime.date(2026, 12, 31)
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    milestone1 = Milestone(
        project_id=project.id,
        title="Milestone 1",
        stage=ProjectStage.PLANNING.value,
        status=MilestoneStatus.PENDING.value
    )
    milestone2 = Milestone(
        project_id=project.id,
        title="Milestone 2",
        stage=ProjectStage.DEVELOPMENT.value,
        status=MilestoneStatus.IN_PROGRESS.value
    )
    db_session.add_all([milestone1, milestone2])
    db_session.commit()

    m1_id = milestone1.id
    m2_id = milestone2.id
    project_id = project.id

    # Verify milestones exist in DB
    assert db_session.query(Milestone).filter(Milestone.id == m1_id).first() is not None
    assert db_session.query(Milestone).filter(Milestone.id == m2_id).first() is not None

    # Delete project
    db_session.delete(project)
    db_session.commit()

    # Verify project is deleted
    assert db_session.query(Project).filter(Project.id == project_id).first() is None

    # Verify associated milestones are also deleted via cascade
    assert db_session.query(Milestone).filter(Milestone.id == m1_id).first() is None
    assert db_session.query(Milestone).filter(Milestone.id == m2_id).first() is None


def test_enums_values():
    assert ProjectStage.PLANNING.value == "PLANNING"
    assert ProjectStage.DESIGN.value == "DESIGN"
    assert ProjectStage.DEVELOPMENT.value == "DEVELOPMENT"
    assert ProjectStage.TESTING.value == "TESTING"
    assert ProjectStage.READY_FOR_DEPLOY.value == "READY_FOR_DEPLOY"
    assert ProjectStage.DONE.value == "DONE"

    assert HealthStatus.ON_TRACK.value == "ON_TRACK"
    assert HealthStatus.AT_RISK.value == "AT_RISK"
    assert HealthStatus.DELAYED.value == "DELAYED"
    assert HealthStatus.COMPLETED.value == "COMPLETED"

    assert MilestoneStatus.PENDING.value == "PENDING"
    assert MilestoneStatus.IN_PROGRESS.value == "IN_PROGRESS"
    assert MilestoneStatus.COMPLETED.value == "COMPLETED"


def test_get_db_yields_session():
    from app.database import get_db
    db_gen = get_db()
    db = next(db_gen)
    assert db is not None
    try:
        next(db_gen)
    except StopIteration:
        pass

