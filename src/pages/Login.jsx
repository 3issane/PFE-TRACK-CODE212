
import { LoginForm } from "../components/login-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium">Go back</span>
        </Button>
      </div>
      <LoginForm className="w-full max-w-md" />
    </div>
  );
};

export default Login;
