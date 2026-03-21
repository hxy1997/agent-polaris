from app.runtime.prompt_compiler import compile_system_prompt


def test_compile_system_prompt_concatenates_base_and_scene_prompt():
    result = compile_system_prompt("Base rules", "Scene rules")

    assert result == "Base rules\n\nScene rules"
