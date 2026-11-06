# design/ — 디자인 담당 영역

- 화면 원본은 Figma. 이 폴더에는 **코드가 읽는 것만** 둔다: 토큰, 아이콘/일러스트 에셋, Figma 링크.
- 토큰은 `tokens/tokens.json` 하나. 프론트는 여기서만 색·폰트·간격을 가져간다.
- 토큰 갱신 방법: Figma `디자인` 페이지에서 프레임을 선택하고 Figma MCP `get_variable_defs`로 변수를 읽어 반영.
- 에셋 파일명: `kebab-case`, 용도 접두사 (`icon-`, `illust-`, `img-`).
- 이 폴더 밖 파일은 수정하지 않는다.
