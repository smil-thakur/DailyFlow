import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { usePreloader } from "@/providers/PreloaderProvider";
import { supabase } from "@/utils/supabase";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const preloaderProvider = usePreloader()
  const handleLogin = async () => {
    const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN as string | undefined
    if (allowedDomain && !email.endsWith("@" + allowedDomain)) {
      toast.error("Invalid email domain", { description: `Use your ${allowedDomain} email` })
      return
    }
    preloaderProvider.show()
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined
        }
      })
      preloaderProvider.hide()
      navigate("/verifyOTP", { state: { email: email } })
    } catch (err) {
      preloaderProvider.hide()
      toast.error(
        "Error in login",
        {
          description: `${err}, please try again later!`
        }
      )

    }
    finally {
      preloaderProvider.hide()
    }
  }
  const onEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }
  const handleAlreadyOTP = () => {
    if (email) {
      navigate("/verifyOTP", { state: { email: email } })
    }
    else {
      toast.error("Enter your email!")
    }
  }
  return (
    <>
      <div className='flex items-center fixed top-0 h-[60px] p-2 w-full'>
        <ModeToggle></ModeToggle>
      </div>
      <div className="flex justify-center items-center">
        <form onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}>
          <Card className="w-md">
            <CardHeader>
              <CardTitle>Login to DailyFlow</CardTitle>
              <CardDescription>Dailyflow manages teammates' schedules, including their leaves, work-from-home days, and compensations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={email} onChange={onEmailChange} type="email" placeholder="Your Email"></Input>
            </CardContent>
            <CardFooter>
              <Button type="submit">Login</Button>
              <Button onClick={() => { handleAlreadyOTP() }} type="button" variant="link">I have an OTP</Button>
            </CardFooter>
          </Card>
        </form>
      </div></>
  )
}

export default AuthPage;