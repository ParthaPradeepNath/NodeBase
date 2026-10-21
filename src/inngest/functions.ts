import { NonRetriableError } from "inngest";

import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";

import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    triggers: [{ event: "workflow/execute.workflow" }],
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      // if the db conn failed it will just retry
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      // const executor = getExecutor(node.type as NodeType);

      if (!Object.values(NodeType).includes(node.type as NodeType)) {
        throw new NonRetriableError(`Invalid node  type: ${node.type}`);
      }

      const executor = getExecutor(node.type as NodeType);

      if (typeof node.data !== "object" || node.data === null) {
        throw new NonRetriableError(`Invalid node data for node ${node.id}`);
      }

      context = await executor({
        // data: node.data as Record<string, unknown>,
        data: node.data as Record<string, unknown>, // Safe after validation
        nodeId: node.id,
        context,
        step,
      });
    }

    return {
      workflowId,
      result: context,
    };
  }
);
