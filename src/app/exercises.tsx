import { PreviewCard } from '@/components/preview-card';
import { SectionScreen } from '@/components/section-screen';
import { EXERCISES } from '@/data/mvp-content';

export default function ExercisesScreen() {
  return (
    <SectionScreen
      eyebrow="Movement library"
      title="Exercises"
      description="A compact starter library for building balanced sessions. Exercise detail and video guidance will come later.">
      {EXERCISES.map((exercise, index) => (
        <PreviewCard
          key={exercise.id}
          index={index}
          eyebrow={exercise.category}
          title={exercise.name}
          description={exercise.focus}
          metadata={[exercise.equipment, exercise.level]}
        />
      ))}
    </SectionScreen>
  );
}
