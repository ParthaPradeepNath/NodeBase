"use client"

import { trpc } from "@/trpc/server"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Client = () => {
    const {data: users} = useSuspenseQuery(trpc.getUsers.queryOptions())
    return (
        <div>
            <h1>This is the client</h1>
        </div>
    )    
}