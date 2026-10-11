import pytest
from datetime import date, timedelta
from starlette.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import Milestone
from app.main import app


@pytest.fixture(scope="function")
def test_db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session, TestingSessionLocal
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(test_db_session):
    session, TestingSessionLocal = test_db_session

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_create_project_api(client):
    payload = {
        "name": "Integration Project Alpha",
        "description": "Integration test project description",
        "target_date": (date.today() + timedelta(days=30)).isoformat(),
    }
    response = client.post("/api/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Integration Project Alpha"
    assert data["description"] == "Integration test project description"
    assert len(data["milestones"]) == 5

    stages = [m["stage"] for m in data["milestones"]]
    assert stages == ["PLANNING", "DESIGN", "DEVELOPMENT", "TESTING", "READY_FOR_DEPLOY"]
    assert data["progress"] == 0.0
    assert data["health_status"] == "ON_TRACK"
    assert data["current_stage"] == "PLANNING"


def test_get_projects_api_and_filtering(client):
    today = date.today()
    # Project 1: future target_date -> ON_TRACK
    p1 = {
        "name": "Project Alpha Searchable",
        "description": "First project",
        "target_date": (today + timedelta(days=20)).isoformat(),
    }
    # Project 2: past target_date -> DELAYED
    p2 = {
        "name": "Project Beta Delayed",
        "description": "Second project",
        "target_date": (today - timedelta(days=5)).isoformat(),
    }

    res1 = client.post("/api/projects", json=p1)
    res2 = client.post("/api/projects", json=p2)
    assert res1.status_code == 201
    assert res2.status_code == 201

    # Get all projects
    all_res = client.get("/api/projects")
    assert all_res.status_code == 200
    all_projects = all_res.json()
    assert len(all_projects) == 2

    # Search filter
    search_res = client.get("/api/projects?search=Searchable")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data) == 1
    assert search_data[0]["name"] == "Project Alpha Searchable"

    # Search filter with no match
    empty_search = client.get("/api/projects?search=NonExistent")
    assert empty_search.status_code == 200
    assert empty_search.json() == []

    # Health filter: DELAYED
    delayed_res = client.get("/api/projects?health=DELAYED")
    assert delayed_res.status_code == 200
    delayed_data = delayed_res.json()
    assert len(delayed_data) == 1
    assert delayed_data[0]["name"] == "Project Beta Delayed"

    # Health filter: ON_TRACK
    ontrack_res = client.get("/api/projects?health=ON_TRACK")
    assert ontrack_res.status_code == 200
    ontrack_data = ontrack_res.json()
    assert len(ontrack_data) == 1
    assert ontrack_data[0]["name"] == "Project Alpha Searchable"

    # Stage filter: PLANNING
    stage_res = client.get("/api/projects?stage=PLANNING")
    assert stage_res.status_code == 200
    assert len(stage_res.json()) == 2


def test_get_project_by_id_and_404(client):
    payload = {
        "name": "Project Detail Test",
        "description": "Testing detail view",
        "target_date": (date.today() + timedelta(days=15)).isoformat(),
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    project_id = create_res.json()["id"]

    # 200 for existing project
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == project_id
    assert data["name"] == "Project Detail Test"

    # 404 for nonexistent project
    not_found_res = client.get("/api/projects/99999")
    assert not_found_res.status_code == 404
    assert not_found_res.json()["detail"] == "Project not found"


def test_update_project_api(client):
    payload = {
        "name": "Original Name",
        "description": "Original Description",
        "target_date": (date.today() + timedelta(days=10)).isoformat(),
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    project_id = create_res.json()["id"]

    update_payload = {
        "name": "Updated Name",
        "target_date": (date.today() + timedelta(days=40)).isoformat(),
    }
    put_res = client.put(f"/api/projects/{project_id}", json=update_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Original Description"
    assert data["target_date"] == update_payload["target_date"]

    # Update nonexistent project -> 404
    not_found_res = client.put("/api/projects/99999", json={"name": "Ghost"})
    assert not_found_res.status_code == 404
    assert not_found_res.json()["detail"] == "Project not found"


def test_delete_project_api_cascade(client, test_db_session):
    session, _ = test_db_session
    payload = {
        "name": "Project To Delete",
        "description": "Testing cascade deletion",
        "target_date": (date.today() + timedelta(days=10)).isoformat(),
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    project_id = create_res.json()["id"]
    assert len(create_res.json()["milestones"]) == 5

    # DELETE project -> 204
    del_res = client.delete(f"/api/projects/{project_id}")
    assert del_res.status_code == 204

    # Subsequent GET -> 404
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 404

    # Verify milestones cascaded in db
    milestones = session.query(Milestone).filter(Milestone.project_id == project_id).all()
    assert len(milestones) == 0

    # Delete nonexistent project -> 404
    del_not_found = client.delete("/api/projects/99999")
    assert del_not_found.status_code == 404
    assert del_not_found.json()["detail"] == "Project not found"


def test_milestone_endpoints_api(client):
    payload = {
        "name": "Project For Milestones",
        "target_date": (date.today() + timedelta(days=15)).isoformat(),
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    project_id = create_res.json()["id"]

    # POST milestone -> 201
    m_create_payload = {
        "title": "Custom Integration Milestone",
        "stage": "DEVELOPMENT",
        "due_date": (date.today() + timedelta(days=5)).isoformat(),
    }
    post_m_res = client.post(f"/api/projects/{project_id}/milestones", json=m_create_payload)
    assert post_m_res.status_code == 201
    m_data = post_m_res.json()
    assert m_data["id"] is not None
    assert m_data["title"] == "Custom Integration Milestone"
    assert m_data["stage"] == "DEVELOPMENT"
    assert m_data["status"] == "PENDING"
    mid = m_data["id"]

    # POST milestone to nonexistent project -> 404
    post_404 = client.post("/api/projects/99999/milestones", json=m_create_payload)
    assert post_404.status_code == 404
    assert post_404.json()["detail"] == "Project not found"

    # PATCH milestone -> 200 updating status to COMPLETED
    patch_payload = {"status": "COMPLETED"}
    patch_res = client.patch(f"/api/projects/{project_id}/milestones/{mid}", json=patch_payload)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "COMPLETED"

    # PATCH milestone nonexistent -> 404
    patch_404 = client.patch(f"/api/projects/{project_id}/milestones/99999", json=patch_payload)
    assert patch_404.status_code == 404

    # DELETE milestone -> 204
    del_m_res = client.delete(f"/api/projects/{project_id}/milestones/{mid}")
    assert del_m_res.status_code == 204

    # DELETE milestone nonexistent -> 404
    del_404 = client.delete(f"/api/projects/{project_id}/milestones/{mid}")
    assert del_404.status_code == 404


def test_get_metrics_api(client):
    # Initially metrics should have 0 projects
    metrics_res = client.get("/api/metrics")
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    assert data["total_projects"] == 0
    assert data["active_projects"] == 0
    assert data["completed_projects"] == 0
    assert "health_summary" in data
    assert data["health_summary"]["on_track"] == 0
    assert "stage_distribution" in data

    # Create a project
    payload = {
        "name": "Project Metrics Test",
        "target_date": (date.today() + timedelta(days=20)).isoformat(),
    }
    client.post("/api/projects", json=payload)

    # Check metrics updated
    metrics_res2 = client.get("/api/metrics")
    assert metrics_res2.status_code == 200
    data2 = metrics_res2.json()
    assert data2["total_projects"] == 1
    assert data2["active_projects"] == 1
    assert data2["health_summary"]["on_track"] == 1
    assert data2["stage_distribution"]["PLANNING"] == 1


def test_cors_headers_present(client):
    options_res = client.options(
        "/api/projects",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert "access-control-allow-origin" in options_res.headers
    assert options_res.headers["access-control-allow-origin"] in ["http://localhost:5173", "*"]

    get_res = client.get("/api/projects", headers={"Origin": "http://localhost:5173"})
    assert get_res.headers.get("access-control-allow-origin") in ["http://localhost:5173", "*"]
