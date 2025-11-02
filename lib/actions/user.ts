"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../db";

export const createOrValidateUser = async () => {
    const user = await currentUser();

    if (!user){
        return {
            status: 401,
            message: "Unauthorized"
        }
    }
    const localUser = await prisma.user.findUnique({
        where: {
            clerkId: user?.id
        }
    });

    if (!localUser) {
        const newUser = await prisma.user.create({
            data: {
                clerkId: user?.id,
                email: user?.emailAddresses[0]?.emailAddress,
                name: user?.fullName || ""
            }
        })

        if (!newUser) {
            return {
                status: 500,
                message: "Error creating user"
            }
        }

        return {
            status: 201,
            data: newUser
        }
    }

    return {
        status: 200,
        data: localUser
    }
}

export const getUser = async () => {
    const user = await currentUser();
    if (!user) {
        return {
            status: 401,
            message: "Unauthorized"
        }
    }
    const localUser = await prisma.user.findUnique({
        where: {
            clerkId: user?.id
        }
    });

    return {
        status: 200,
        data: localUser
    }
}