import { WorkspaceEmptyState } from "@/components/shared/workspace-empty-state";

export function ConsultationsEmptyWorkspace() {
  return (
    <WorkspaceEmptyState
      title="아직 등록된 상담이 없습니다"
      description="다음 디자인 검증 단계에서 가공 목업 데이터로 상담 목록, 이력, 매물 찾기 흐름을 먼저 완성합니다."
    />
  );
}
