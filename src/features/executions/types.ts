import type { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

// Data in this dynamic thing(TData = Record<string, unknown>) represent whatever we have in the dialog there
//  which can be anything depending on the node
// therefore, makes no sense to have any strict definition of types of it
export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
  // publish: TODO Add realtime later
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;
