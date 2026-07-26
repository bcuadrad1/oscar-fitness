import { PreviewCard } from '@/components/preview-card';
import { SectionScreen } from '@/components/section-screen';
import { ADMIN_AREAS } from '@/data/mvp-content';

export default function AdminScreen() {
  return (
    <SectionScreen
      eyebrow="Workspace foundation"
      title="Admin"
      description="A read-only preview of future management areas. No accounts, protected operations, or publishing tools are active in this MVP.">
      {ADMIN_AREAS.map((area, index) => (
        <PreviewCard
          key={area.id}
          index={index}
          eyebrow={area.status}
          title={area.title}
          description={area.description}
          metadata={['Coming later']}
        />
      ))}
    </SectionScreen>
  );
}
