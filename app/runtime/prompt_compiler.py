def compile_system_prompt(base_prompt: str | None, scene_prompt: str) -> str:
    if not base_prompt:
        return scene_prompt

    return f"{base_prompt}\n\n{scene_prompt}"
