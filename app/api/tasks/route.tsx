import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {success, z} from "zod"

const createTaskSceheme = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional()
})

export async function GET(request : Request) {
    try {
        const tasks = await prisma.task.findMany({
            where:{
                deleted_at : null
            },
            orderBy:{
                createdAt : 'desc'
            }
        })
        return NextResponse.json({success : "true", data : tasks})
    } catch (error) {
        return NextResponse.json({success : "false", message : "Error server"}, {status : 500})
    }
}

export async function POST(request : Request) {
    try {
        const body = await request.json()
        const validation = createTaskSceheme.safeParse(body)

        if(!validation){
            return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
        }

        const newTask = await prisma.task.create({
            data : {
                title : validation.data?.title,
                description : validation.data?.description
            }
        })

        return NextResponse.json({ success: true, data: newTask }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Gagal membuat task" }, { status: 500 });
    }
}