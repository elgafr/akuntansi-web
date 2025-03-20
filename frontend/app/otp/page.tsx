// import InputOTPControlled from "./InputOTPControlled"
import { InputOTPControlled } from "@/components/input_otp"

export default function Page() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <InputOTPControlled />
            </div>
        </div>
    )
}