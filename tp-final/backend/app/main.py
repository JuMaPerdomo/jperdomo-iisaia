from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Milestone
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    MetricsResponse,
)
from app import crud

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Tracking Dashboard API",
    version="1.0.0",
)

# Configure CORS for decoupled frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Project Endpoints ---

@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(
    stage: Optional[str] = None,
    health: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve all projects with optional filtering by stage, health status, or search query."""
    return crud.get_projects(db, stage=stage, health=health, search=search)


@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
):
    """Create a new project with 5 auto-generated default lifecycle milestones."""
    return crud.create_project(db, project_in=project_in)


@app.get("/api/projects/{id}", response_model=ProjectResponse)
def get_project(
    id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a single project by ID."""
    project = crud.get_project_by_id(db, project_id=id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@app.put("/api/projects/{id}", response_model=ProjectResponse)
def update_project(
    id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
):
    """Update fields of an existing project."""
    project = crud.update_project(db, project_id=id, project_in=project_in)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@app.delete("/api/projects/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    id: int,
    db: Session = Depends(get_db),
):
    """Delete a project and cascade-delete all its associated milestones."""
    success = crud.delete_project(db, project_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Milestone Endpoints ---

@app.post(
    "/api/projects/{id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_milestone(
    id: int,
    milestone_in: MilestoneCreate,
    db: Session = Depends(get_db),
):
    """Add a custom milestone to a project."""
    milestone = crud.add_milestone(db, project_id=id, milestone_in=milestone_in)
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return milestone


@app.patch(
    "/api/projects/{id}/milestones/{milestone_id}",
    response_model=MilestoneResponse,
)
def update_milestone(
    id: int,
    milestone_id: int,
    milestone_in: MilestoneUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing milestone of a project."""
    project = crud.get_project_by_id(db, project_id=id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    milestone = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.project_id == id)
        .first()
    )
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    return crud.update_milestone(db, milestone_id=milestone_id, milestone_in=milestone_in)


@app.delete(
    "/api/projects/{id}/milestones/{milestone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_milestone(
    id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
):
    """Delete a milestone from a project."""
    project = crud.get_project_by_id(db, project_id=id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    milestone = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.project_id == id)
        .first()
    )
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    crud.delete_milestone(db, milestone_id=milestone_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Dashboard Metrics Endpoint ---

@app.get("/api/metrics", response_model=MetricsResponse)
def get_metrics(
    db: Session = Depends(get_db),
):
    """Retrieve aggregated dashboard metrics (total, active, completed, health counts, stage distribution)."""
    return crud.get_dashboard_metrics(db)
