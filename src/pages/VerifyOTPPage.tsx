import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { usePreloader } from "@/providers/PreloaderProvider"
import { supabase } from "@/utils/supabase"
import { LucideArrowLeft } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

const VerifyOTPPage = () => {
    const preloaderProvider = usePreloader()
    const [otp, setOtp] = useState("");
    const location = useLocation()
    const navigate = useNavigate()
    const email: string = location.state?.email;

    const handleOTPInput = (value: string) => {
        setOtp(value)
    }

    const handleVerifyOTP = async () => {
        preloaderProvider.show()
        try {
            await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email"
            })
            preloaderProvider.hide()
            await supabase.auth.updateUser({
                data: { displayName: email.split("@")[0] }
            });
            navigate("/home")

        } catch (err) {
            preloaderProvider.hide()
            toast.error(
                "Unable to verify your orp",
                {
                    description: `${err}, try again later!`
                }
            )
        }
    }
    const handleBack = () => {

        navigate("/auth")
    }

    return (
        <>
            <div className='flex items-center fixed top-0 h-[60px] p-2 w-full'>
                <ModeToggle></ModeToggle>
            </div>
            <div className="main items-center">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOTP();
                }}>
                    <Card className="w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Button type="button" onClick={() => { handleBack() }} variant="outline"><LucideArrowLeft></LucideArrowLeft></Button>
                                Verify OTP
                            </CardTitle>
                            <CardDescription>
                                An OTP has been sent to your previously used email. Please enter the OTP to log in.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InputOTP maxLength={6} onChange={handleOTPInput}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Verify & Login</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    )
}

export default VerifyOTPPage