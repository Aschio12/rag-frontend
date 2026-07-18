// Public Aether Core surface
export { AetherCore } from "./AetherCore";
export { AetherCoreMaterial } from "./CoreMaterial";
export { CoreCamera } from "./CoreCamera";
export { CoreController } from "./CoreController";
export { CoreHalo } from "./CoreHalo";
export { CoreMesh } from "./CoreMesh";
export { CoreParticles } from "./CoreParticles";
export { CoreRings } from "./CoreRings";
export { CoreSignals } from "./CoreSignals";
export { coreBus, useCoreState, useCoreEmitter, useCoreVitalPatch } from "./useCoreState";
export { useStreamingController } from "./StreamingController";
export {
  reduceCore,
  initialCore,
} from "./state-machine";
export type { CoreState, CoreEvent, CoreVital } from "./state-machine";
