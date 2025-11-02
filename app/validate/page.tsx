"use client";

import Spinner from "@/components/shared/Spinner";
import { createOrValidateUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function ValidatePage() {
    let message;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const findUser = async () => {
            setLoading(true);
            const user = await createOrValidateUser();

            if (user.status === 200 || user.status === 201) {
                return redirect("/platform/dashboard/billing");
            }
            if (user.status === 401) {
                message = user.message;
                return redirect("/sign-in");
            }
            
            if (user.status === 500) {
                message = user.message;
                return redirect("/");
            }
            setLoading(false);
        }
        findUser();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Spinner text="Validando usuario..." />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <p>{message}</p>
                </div>
            )}
        </div>
    )
}