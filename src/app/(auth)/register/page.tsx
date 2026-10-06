import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
