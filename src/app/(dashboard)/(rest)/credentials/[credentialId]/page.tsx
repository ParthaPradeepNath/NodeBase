import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: Promise<{
        credentialId: string
    }>
}
    
// params should be awaited in dynamic APIs
const Page = async  ({params}: PageProps) => {
    await requireAuth()
    const {credentialId} = await params;

    return (
        <div>Credential id:</div>
    )

}

export default Page