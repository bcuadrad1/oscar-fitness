import { PreviewCard } from '@/components/preview-card';
import { SectionScreen } from '@/components/section-screen';
import { ROUTINES } from '@/data/mvp-content';

export default function RoutinesScreen() {
  return (
    <SectionScreen
      eyebrow="Training plans"
      title="Routines"
      description="Static session previews for the first Oscar Fitness experience. Scheduling and workout tracking are intentionally not connected yet.">
      {ROUTINES.map((routine, index) => (
        <PreviewCard
          key={routine.id}
          index={index}
          eyebrow={`${routine.durationMinutes} minute session`}
          title={routine.name}
          description={routine.description}
          metadata={[`${routine.exerciseCount} exercises`, routine.level]}
        />
      ))}
    </SectionScreen>
  );
}
