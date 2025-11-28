import Footer from "@/components/Footer/Footer";
import RegisterClient from "./RegisterClient";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

const Register = async () => {

  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <>
      <div className="register-block md:py-20 py-10 border-y">
        <div className="container !max-w-[650px]">
          <RegisterClient />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
