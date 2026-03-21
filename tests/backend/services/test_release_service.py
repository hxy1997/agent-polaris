from app.services.release_service import ReleaseService


def test_publish_scene_writes_snapshot_and_current_pointer(tmp_path):
    service = ReleaseService(
        platform_root=tmp_path / "platform",
        workspace_root=tmp_path / "workspaces",
    )

    version = service.publish_scene("sales-assistant")

    assert (tmp_path / "platform" / "releases" / "sales-assistant" / version / "snapshot.json").exists()
    assert (tmp_path / "platform" / "releases" / "sales-assistant" / "current.json").exists()
