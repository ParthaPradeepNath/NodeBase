import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: Promise<{
        workflowId: string
    }>
}
    
// params should be awaited in dynamic APIs
const Page = async  ({params}: PageProps) => {
    await requireAuth()
    const {workflowId} = await params;

    return (
        <div>Workflowss id:</div>
    )

}

export default Page