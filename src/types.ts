export type SceneId =
  | 'intro'
  | 'memory'
  | 'coffee'
  | 'cinema'
  | 'heart'
  | 'letter'
  | 'finale'

export interface SceneProps {
  onNext: (next: SceneId) => void
}
