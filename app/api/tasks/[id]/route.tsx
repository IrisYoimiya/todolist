import { z } from "zod";
import {prisma} from "../../../../lib/prisma"
import { NextResponse } from "next/server";


type Params = Promise<{id : string}>

export async function GET(request : Request, {params} : {params : Params}) {
    const {id} = await params
    const taskId = parseInt(id)

    try {
        const task = await prisma.task.findFirst({
            where : {
                id : taskId,
                deleted_at : null
            }
        })
        if (!task) {
            return NextResponse.json(
                { success: false, message: "Task tidak ditemukan" }, 
                { status: 404 }
            );
        }
        return NextResponse.json({success : true, data : task})
    } catch (error) {
        return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }
}

const updateTask = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    isCompleted: z.boolean().optional()
})

export async function PUT(request : Request, {params} : {params : Params}) {
    const {id} = await params
    const taskId = parseInt(id)

    try {
        const body = await request.json();
        const validation = updateTask.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, errors: validation.error.format() }, 
                { status: 400 }
            );
        }
        const updatedTask = await prisma.task.update({
        where: { id : taskId },
        data: validation.data
        });

        return NextResponse.json({ success: true, data: updatedTask });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Gagal update" , detail : error.message}, { status: 500 });
    }
    }

export async function DELETE(request : Request, {params} : {params : Params}) {
    const {id} = await params
    const taskId = parseInt(id)
    
    try {
        const softDeleted = await prisma.task.update({
        where: { id : taskId },
        data: {
            deleted_at: new Date()
        }
        });

        return NextResponse.json({ success: true, message: "Berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Gagal menghapus" }, { status: 500 });
    }
}