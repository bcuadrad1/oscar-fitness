import { PreviewCard } from '@/components/preview-card';
import { SectionScreen } from '@/components/section-screen';
import { HOME_AREAS } from '@/data/mvp-content';

export default function HomeScreen() {
  return (
    <SectionScreen
      eyebrow="Oscar Fitness / Home"
      title="Train with a plan."
      description="A clear starting point for movements, training sessions, and the tools that will support them.">
      {HOME_AREAS.map((area, index) => (
        <PreviewCard
          key={area.id}
          index={index}
          eyebrow={area.label}
          title={area.title}
          description={area.description}
        />
      ))}
    </SectionScreen>
  );
}
