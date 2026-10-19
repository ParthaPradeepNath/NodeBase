import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

// params should be awaited in dynamic APIs
const Page = async ({ params }: PageProps) => {
  await requireAuth();
  await params;

  return <div>Execution id:</div>;
};

export default Page;
